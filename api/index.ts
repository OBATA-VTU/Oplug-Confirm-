import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import Mailjet from 'node-mailjet';

dotenv.config();

export const app = express();
app.use(express.json());

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY || '',
  process.env.MAILJET_SECRET_KEY || ''
);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
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
    const response = await axios.post(`${BILLSTACK_BASE_URL}/generateVirtualAccount/`, req.body, {
      headers: { 'Authorization': `Bearer ${process.env.BILLSTACK_SECRET_KEY}` }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Billstack API Error' });
  }
});

// --- Paystack API Proxy ---
app.post('/api/funding/paystack-initialize', async (req, res) => {
  try {
    const { email, amount, reference } = req.body;
    const response = await axios.post('https://api.paystack.co/transaction/initialize', {
      email,
      amount: amount * 100, // Paystack expects kobo
      reference,
      callback_url: `${process.env.APP_URL || 'https://oplug.vercel.app'}/dashboard`
    }, {
      headers: { 'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Paystack API Error' });
  }
});

// --- Webhook for Funding ---
app.post('/api/funding/webhook', async (req, res) => {
  const event = req.body;
  console.log('Webhook received:', event);
  res.status(200).send('OK');
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
