import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import Mailjet from 'node-mailjet';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase configuration
let firebaseConfig: any;
try {
  // Try multiple possible locations for the config file
  const possiblePaths = [
    path.resolve(process.cwd(), 'firebase-applet-config.json'),
    path.resolve(process.cwd(), 'api', 'firebase-applet-config.json'),
    path.join(__dirname, '..', 'firebase-applet-config.json'),
    path.join(__dirname, 'firebase-applet-config.json')
  ];
  
  let configContent = null;
  for (const p of possiblePaths) {
    try {
      configContent = readFileSync(p, 'utf8');
      console.log(`Loaded firebase config from: ${p}`);
      break;
    } catch (e) {
      // Continue to next path
    }
  }

  if (configContent) {
    firebaseConfig = JSON.parse(configContent);
  } else {
    throw new Error('Could not find firebase-applet-config.json in any expected location');
  }
} catch (error) {
  console.error('Error loading firebase-applet-config.json:', error);
  firebaseConfig = {};
}

// Initialize Firebase Admin
if (!admin.apps.length && firebaseConfig.projectId) {
  try {
    admin.initializeApp({
      projectId: firebaseConfig.projectId,
    });
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
  }
}

const databaseId = firebaseConfig.firestoreDatabaseId;
const adminDb = databaseId && databaseId !== '(default)' 
  ? getFirestore(databaseId) 
  : getFirestore();

export const app = express();
app.use(express.json());

const mailjet = process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY
  ? new Mailjet({
      apiKey: process.env.MAILJET_API_KEY,
      apiSecret: process.env.MAILJET_SECRET_KEY
    })
  : null;

app.get('/api/ping', (req, res) => {
  res.json({ status: 'pong', time: new Date().toISOString() });
});

app.get('/api/health', async (req, res) => {
  try {
    // Check if settings exist, if not create them
    const settingsRef = adminDb.collection('settings').doc('general');
    const settingsSnap = await settingsRef.get();
    if (!settingsSnap.exists) {
      await settingsRef.set({
        siteName: 'Oplug',
        siteDescription: 'Fastest VTU Platform in Nigeria',
        announcement: 'Welcome to Oplug! Buy data and airtime at the cheapest rates.',
        referralBonus: 50,
        resellerUpgradeFee: 2000,
        smartUserPackageName: 'Smart User',
        resellerPackageName: 'Reseller',
        heroImage: 'https://images.unsplash.com/photo-1556157382-97dee2dcb756?auto=format&fit=crop&q=80&w=1000'
      });
      console.log('Default settings initialized');
    }
    res.json({ status: 'ok', time: new Date().toISOString(), database: databaseId || 'default' });
  } catch (error: any) {
    console.error('Health check error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.get('/api/auth/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const snapshot = await adminDb.collection('users')
      .where('username', '==', username.toLowerCase())
      .limit(1)
      .get();
    
    res.json({ available: snapshot.empty });
  } catch (error: any) {
    console.error('Check username error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// --- Email OTP ---
app.post('/api/auth/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  if (!mailjet) return res.status(500).json({ message: 'Email service not configured' });

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    await adminDb.collection('otps').doc(email).set({
      otp,
      expiresAt,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: 'noreply@oplug.com.ng', // Ensure this is a verified sender in Mailjet
            Name: 'Oplug'
          },
          To: [{ Email: email }],
          Subject: 'Your Verification Code - Oplug',
          HTMLPart: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #1d4ed8; text-align: center;">Oplug Verification</h2>
              <p>Hello,</p>
              <p>Your verification code is:</p>
              <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #111827; border-radius: 8px; margin: 20px 0;">
                ${otp}
              </div>
              <p>This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #6b7280; text-align: center;">&copy; ${new Date().getFullYear()} Oplug. All rights reserved.</p>
            </div>
          `
        }
      ]
    });

    res.json({ status: 'success', message: 'OTP sent successfully' });
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

  try {
    const otpDoc = await adminDb.collection('otps').doc(email).get();
    if (!otpDoc.exists) return res.status(400).json({ message: 'Invalid or expired OTP' });

    const data = otpDoc.data();
    if (data?.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (Date.now() > data?.expiresAt) return res.status(400).json({ message: 'OTP has expired' });

    // Mark as verified in users collection
    const userSnapshot = await adminDb.collection('users').where('email', '==', email).limit(1).get();
    if (!userSnapshot.empty) {
      await userSnapshot.docs[0].ref.update({ isPhoneVerified: true }); // Keeping field name for compatibility
    }

    // Delete OTP after successful verification
    await otpDoc.ref.delete();

    res.json({ status: 'success', message: 'Verification successful' });
  } catch (error: any) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ message: 'Verification failed' });
  }
});

// --- Inlomax API Proxy (VTU) ---
const INLOMAX_BASE_URL = 'https://inlomax.com/api';

app.get('/api/vtu/balance', async (req, res) => {
  try {
    const response = await axios.get(`${INLOMAX_BASE_URL}/balance`, {
      headers: { 'Authorization': `Token ${process.env.INLOMAX_API_KEY}` }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Inlomax API Error' });
  }
});

app.get('/api/vtu/services', async (req, res) => {
  try {
    const response = await axios.get(`${INLOMAX_BASE_URL}/services`, {
      headers: { 'Authorization': `Token ${process.env.INLOMAX_API_KEY}` }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Inlomax API Error' });
  }
});

app.post('/api/vtu/airtime', async (req, res) => {
  try {
    const response = await axios.post(`${INLOMAX_BASE_URL}/airtime`, req.body, {
      headers: { 'Authorization': `Token ${process.env.INLOMAX_API_KEY}` }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Inlomax API Error' });
  }
});

app.post('/api/vtu/data', async (req, res) => {
  try {
    const response = await axios.post(`${INLOMAX_BASE_URL}/data`, req.body, {
      headers: { 'Authorization': `Token ${process.env.INLOMAX_API_KEY}` }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Inlomax API Error' });
  }
});

app.post('/api/vtu/validate-cable', async (req, res) => {
  try {
    const response = await axios.post(`${INLOMAX_BASE_URL}/validatecable`, req.body, {
      headers: { 'Authorization': `Token ${process.env.INLOMAX_API_KEY}` }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Inlomax API Error' });
  }
});

app.post('/api/vtu/cable', async (req, res) => {
  try {
    const response = await axios.post(`${INLOMAX_BASE_URL}/subcable`, req.body, {
      headers: { 'Authorization': `Token ${process.env.INLOMAX_API_KEY}` }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Inlomax API Error' });
  }
});

app.post('/api/vtu/validate-meter', async (req, res) => {
  try {
    const response = await axios.post(`${INLOMAX_BASE_URL}/validatemeter`, req.body, {
      headers: { 'Authorization': `Token ${process.env.INLOMAX_API_KEY}` }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Inlomax API Error' });
  }
});

app.post('/api/vtu/electricity', async (req, res) => {
  try {
    const response = await axios.post(`${INLOMAX_BASE_URL}/payelectric`, req.body, {
      headers: { 'Authorization': `Token ${process.env.INLOMAX_API_KEY}` }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Inlomax API Error' });
  }
});

app.post('/api/vtu/education', async (req, res) => {
  try {
    const response = await axios.post(`${INLOMAX_BASE_URL}/education`, req.body, {
      headers: { 'Authorization': `Token ${process.env.INLOMAX_API_KEY}` }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Inlomax API Error' });
  }
});

// --- OgaViral API Proxy (SMM) ---
const OGAVIRAL_BASE_URL = 'https://ogaviral.com/api/v2';

app.post('/api/smm/action', async (req, res) => {
  try {
    const response = await axios.post(OGAVIRAL_BASE_URL, {
      key: process.env.OGAVIRAL_API_KEY,
      ...req.body
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'OgaViral API Error' });
  }
});

// --- Billstack API Proxy (Virtual Accounts) ---
const BILLSTACK_BASE_URL = 'https://api.billstack.co/v2/thirdparty';

app.post('/api/funding/generate-account', async (req, res) => {
  try {
    // Try with the user's provided email first
    const response = await axios.post(`${BILLSTACK_BASE_URL}/generateVirtualAccount/`, req.body, {
      headers: { 'Authorization': `Bearer ${process.env.BILLSTACK_SECRET_KEY}` }
    });
    res.json(response.data);
  } catch (error: any) {
    console.error('Billstack Initial Error:', error.response?.data || error.message);
    
    // If it fails, try with a fallback email
    try {
      const fallbackEmail = `opluguser${Math.floor(Math.random() * 10000)}@gmail.com`;
      console.log(`Retrying with fallback email: ${fallbackEmail}`);
      
      const fallbackBody = { ...req.body, email: fallbackEmail };
      const fallbackResponse = await axios.post(`${BILLSTACK_BASE_URL}/generateVirtualAccount/`, fallbackBody, {
        headers: { 'Authorization': `Bearer ${process.env.BILLSTACK_SECRET_KEY}` }
      });
      
      res.json(fallbackResponse.data);
    } catch (fallbackError: any) {
      console.error('Billstack Fallback Error:', fallbackError.response?.data || fallbackError.message);
      res.status(fallbackError.response?.status || 500).json(fallbackError.response?.data || { message: 'Billstack API Error after fallback' });
    }
  }
});

// --- Paystack API Proxy ---
app.post('/api/funding/paystack-initialize', async (req, res) => {
  const { email, amount, reference, metadata } = req.body;
  
  const initialize = async (targetEmail: string) => {
    return axios.post('https://api.paystack.co/transaction/initialize', {
      email: targetEmail,
      amount: Math.round(amount * 100), // Paystack expects kobo
      reference,
      metadata,
      callback_url: `${process.env.APP_URL || 'https://oplug.vercel.app'}/dashboard`
    }, {
      headers: { 'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    });
  };

  try {
    const response = await initialize(email);
    res.json(response.data);
  } catch (error: any) {
    console.error('Paystack Initialize Initial Error:', error.response?.data || error.message);
    
    try {
      const fallbackEmail = `opluguser${Math.floor(Math.random() * 10000)}@gmail.com`;
      console.log(`Retrying Paystack Initialize with fallback email: ${fallbackEmail}`);
      const fallbackResponse = await initialize(fallbackEmail);
      res.json(fallbackResponse.data);
    } catch (fallbackError: any) {
      res.status(fallbackError.response?.status || 500).json(fallbackError.response?.data || { message: 'Paystack API Error after fallback' });
    }
  }
});

app.post('/api/funding/paystack-dynamic-account', async (req, res) => {
  const { email, amount, reference } = req.body;

  const charge = async (targetEmail: string) => {
    return axios.post('https://api.paystack.co/charge', {
      email: targetEmail,
      amount: amount * 100,
      reference,
      bank_transfer: {} // This triggers bank transfer details generation
    }, {
      headers: { 'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    });
  };

  try {
    const response = await charge(email);
    res.json(response.data);
  } catch (error: any) {
    console.error('Paystack Dynamic Account Initial Error:', error.response?.data || error.message);
    
    try {
      const fallbackEmail = `opluguser${Math.floor(Math.random() * 10000)}@gmail.com`;
      console.log(`Retrying Paystack Dynamic Account with fallback email: ${fallbackEmail}`);
      const fallbackResponse = await charge(fallbackEmail);
      res.json(fallbackResponse.data);
    } catch (fallbackError: any) {
      res.status(fallbackError.response?.status || 500).json(fallbackError.response?.data || { message: 'Paystack API Error after fallback' });
    }
  }
});

// --- Webhook for Funding ---
app.post('/api/funding/webhook', async (req, res) => {
  const event = req.body;
  console.log('Webhook received:', event);

  if (event.event === 'charge.success') {
    const { reference, metadata, customer, amount } = event.data;
    
    // Handle Quick Purchase
    if (metadata && metadata.type === 'quick_purchase') {
      const { serviceType, network, phone, planId, meterType, quantity } = metadata;
      try {
        let endpoint = '';
        let payload: any = {};

        switch (serviceType) {
          case 'data':
            endpoint = '/data';
            payload = { serviceID: planId, mobileNumber: phone };
            break;
          case 'airtime':
            endpoint = '/airtime';
            payload = { serviceID: planId, mobileNumber: phone, amount: metadata.amount };
            break;
          case 'cable':
            endpoint = '/subcable';
            payload = { serviceID: planId, iucNum: phone };
            break;
          case 'electricity':
            endpoint = '/payelectric';
            payload = { serviceID: planId, meterNum: phone, meterType: meterType, amount: metadata.amount };
            break;
          case 'education':
            endpoint = '/education';
            payload = { serviceID: planId, quantity: quantity || 1 };
            break;
          case 'smm':
            // SMM uses OgaViral
            await axios.post(OGAVIRAL_BASE_URL, {
              key: process.env.OGAVIRAL_API_KEY,
              action: 'add',
              service: planId,
              link: phone,
              quantity: quantity
            });
            console.log(`Quick SMM purchase successful for ${phone}`);
            return res.status(200).send('OK');
        }

        if (endpoint) {
          await axios.post(`${INLOMAX_BASE_URL}${endpoint}`, payload, {
            headers: { 'Authorization': `Token ${process.env.INLOMAX_API_KEY}` }
          });
          console.log(`Quick ${serviceType} purchase successful for ${phone}`);
        }
      } catch (err: any) {
        console.error('Quick Purchase Fulfillment Error:', err.response?.data || err.message);
      }
    }
    
    // Handle Wallet Funding (Normal)
    // This is usually handled by the frontend checking status or a separate backend logic
    // that updates the user's balance in Firestore.
    // Since we don't have direct Firestore write access from here (unless we use Admin SDK),
    // we'll assume the frontend handles the balance update or we'd need to add Admin SDK.
  }

  res.status(200).send('OK');
});

// --- NOWPayments API Proxy ---
const NOWPAYMENTS_BASE_URL = 'https://api.nowpayments.io/v1';

app.get('/api/crypto/status', async (req, res) => {
  try {
    const response = await axios.get(`${NOWPAYMENTS_BASE_URL}/status`, {
      headers: { 'x-api-key': process.env.NOWPAYMENTS_API_KEY || process.env.VITE_NOWPAYMENTS_API_KEY }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'NOWPayments API Error' });
  }
});

app.get('/api/crypto/currencies', async (req, res) => {
  try {
    const response = await axios.get(`${NOWPAYMENTS_BASE_URL}/currencies?fixed_rate=true`, {
      headers: { 'x-api-key': process.env.NOWPAYMENTS_API_KEY || process.env.VITE_NOWPAYMENTS_API_KEY }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'NOWPayments API Error' });
  }
});

app.get('/api/crypto/min-amount', async (req, res) => {
  try {
    const { currency_from, currency_to } = req.query;
    const response = await axios.get(`${NOWPAYMENTS_BASE_URL}/min-amount`, {
      params: { currency_from, currency_to },
      headers: { 'x-api-key': process.env.NOWPAYMENTS_API_KEY || process.env.VITE_NOWPAYMENTS_API_KEY }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'NOWPayments API Error' });
  }
});

app.get('/api/crypto/estimate', async (req, res) => {
  try {
    const { amount, currency_from, currency_to } = req.query;
    const response = await axios.get(`${NOWPAYMENTS_BASE_URL}/estimate`, {
      params: { amount, currency_from, currency_to },
      headers: { 'x-api-key': process.env.NOWPAYMENTS_API_KEY || process.env.VITE_NOWPAYMENTS_API_KEY }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'NOWPayments API Error' });
  }
});

app.post('/api/crypto/payment', async (req, res) => {
  try {
    const response = await axios.post(`${NOWPAYMENTS_BASE_URL}/payment`, req.body, {
      headers: { 
        'x-api-key': process.env.NOWPAYMENTS_API_KEY || process.env.VITE_NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'NOWPayments API Error' });
  }
});

app.post('/api/crypto/invoice', async (req, res) => {
  try {
    const response = await axios.post(`${NOWPAYMENTS_BASE_URL}/invoice`, req.body, {
      headers: { 
        'x-api-key': process.env.NOWPAYMENTS_API_KEY || process.env.VITE_NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'NOWPayments API Error' });
  }
});

app.get('/api/crypto/payment/:id', async (req, res) => {
  try {
    const response = await axios.get(`${NOWPAYMENTS_BASE_URL}/payment/${req.params.id}`, {
      headers: { 'x-api-key': process.env.NOWPAYMENTS_API_KEY || process.env.VITE_NOWPAYMENTS_API_KEY }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'NOWPayments API Error' });
  }
});

// --- Mailjet Email Route ---
app.post('/api/email/welcome', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!process.env.MAILJET_API_KEY) {
      return res.status(200).json({ message: 'Mailjet not configured, skipping email' });
    }

    const result = await mailjet
      .post("send", { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: "noreply@oplug.com",
              Name: "OPLUG VTU"
            },
            To: [
              {
                Email: email,
                Name: name
              }
            ],
            Subject: "Welcome to OPLUG VTU - Your Gateway to Seamless VTU Services!",
            TextPart: `Hi ${name}, welcome to OPLUG VTU!`,
            HTMLPart: `
              <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #1d4ed8; padding: 40px 20px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.02em;">OPLUG VTU</h1>
                </div>
                <div style="padding: 40px 30px; background-color: white;">
                  <h2 style="color: #111827; margin-top: 0; font-size: 22px;">Welcome aboard, ${name}! 🚀</h2>
                  <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
                    We're thrilled to have you join the OPLUG family. You've just taken the first step towards the fastest and most reliable VTU experience in Nigeria.
                  </p>
                  <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 30px 0;">
                    <h3 style="color: #111827; margin-top: 0; font-size: 16px;">What's Next?</h3>
                    <ul style="color: #4b5563; padding-left: 20px; margin-bottom: 0;">
                      <li style="margin-bottom: 10px;"><b>Fund Your Wallet:</b> Use your dedicated virtual account to add funds instantly.</li>
                      <li style="margin-bottom: 10px;"><b>Buy Data & Airtime:</b> Enjoy massive discounts on all networks.</li>
                      <li style="margin-bottom: 10px;"><b>Refer & Earn:</b> Share your link and get paid for every friend who joins.</li>
                    </ul>
                  </div>
                  <a href="${process.env.APP_URL || 'https://oplug.vercel.app'}/dashboard" style="display: inline-block; background-color: #1d4ed8; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; margin-top: 10px;">Go to Dashboard</a>
                </div>
                <div style="padding: 20px 30px; background-color: #f3f4f6; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    © ${new Date().getFullYear()} OPLUG Tech. All rights reserved.<br>
                    If you didn't create an account, please ignore this email.
                  </p>
                </div>
              </div>
            `
          }
        ]
      });
    res.json(result.body);
  } catch (error: any) {
    console.error('Mailjet Error:', error);
    res.status(500).json({ message: 'Email sending failed' });
  }
});

export default app;
