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
if (!admin.apps.length) {
  try {
    // Prioritize the projectId from the config file as it's the one provisioned for this app
    const projectId = firebaseConfig.projectId || process.env.GOOGLE_CLOUD_PROJECT || process.env.PROJECT_ID;
    console.log('Environment Project IDs:', {
      config: firebaseConfig.projectId,
      GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT,
      PROJECT_ID: process.env.PROJECT_ID,
      GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS ? 'SET' : 'NOT SET'
    });
    
    if (projectId) {
      console.log(`Initializing Firebase Admin with Project ID: ${projectId}`);
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: projectId
      });
    } else {
      console.log('Initializing Firebase Admin with default settings (auto-discovery)');
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
    }
    
    const app = admin.app();
    console.log(`Firebase Admin initialized successfully. Project ID in app: ${app.options.projectId || 'auto-discovered'}`);
    
    if (projectId && app.options.projectId && app.options.projectId !== projectId) {
      console.warn(`WARNING: Admin Project ID (${app.options.projectId}) does not match requested Project ID (${projectId})`);
    }
  } catch (error: any) {
    console.error('Error initializing Firebase Admin:', error.message);
    try {
      // Fallback to default initialization which uses environment credentials
      if (admin.apps.length === 0) {
        admin.initializeApp();
        console.log('Firebase Admin initialized with default fallback');
      }
    } catch (e: any) {
      console.error('Failed to initialize Firebase Admin even with defaults:', e.message);
    }
  }
}

const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';
console.log(`Config Database ID: ${databaseId}`);

let adminDb: admin.firestore.Firestore;
let currentDbId = databaseId;

function initDb(dbId?: string) {
  try {
    if (dbId && dbId !== '(default)') {
      console.log(`Initializing Firestore Admin with databaseId: ${dbId}`);
      return getFirestore(admin.app(), dbId);
    }
    console.log('Initializing Firestore Admin with default database');
    return getFirestore(admin.app());
  } catch (error) {
    console.error(`Error initializing Firestore Admin with ${dbId}, falling back to default:`, error);
    return getFirestore(admin.app());
  }
}

adminDb = initDb(currentDbId);

// Database health check on startup to set correct database ID
async function checkDatabaseHealth() {
  try {
    console.log(`Checking health of database: ${currentDbId}...`);
    // Use a simple get to check connectivity and permissions
    await adminDb.collection('health_check').doc('status').get();
    console.log(`Database ${currentDbId} is healthy.`);
  } catch (error: any) {
    console.warn(`Database ${currentDbId} health check failed: ${error.message} (Code: ${error.code})`);
    if ((error.code === 5 || error.code === 7 || error.message?.includes('NOT_FOUND') || error.message?.includes('PERMISSION_DENIED')) && currentDbId !== '(default)') {
      console.log('Switching to (default) database due to health check failure...');
      currentDbId = '(default)';
      adminDb = initDb(currentDbId);
      clientDb = initClientDb(currentDbId);
    }
  }
}
checkDatabaseHealth();

import { initializeApp as initializeClientApp } from 'firebase/app';
import { getFirestore as getClientFirestore, doc, setDoc, getDoc, serverTimestamp as clientServerTimestamp, enableIndexedDbPersistence, terminate } from 'firebase/firestore';

// Initialize Client SDK as fallback
let clientDb: any;
function initClientDb(dbId?: string) {
  try {
    const clientApp = initializeClientApp(firebaseConfig);
    if (dbId && dbId !== '(default)') {
      console.log(`Initializing Firestore Client with databaseId: ${dbId}`);
      return getClientFirestore(clientApp, dbId);
    }
    console.log('Initializing Firestore Client with default database');
    return getClientFirestore(clientApp);
  } catch (error) {
    console.error('Error initializing Firebase Client SDK:', error);
    return null;
  }
}
clientDb = initClientDb(currentDbId);

// Helper for retrying Firestore operations
async function withRetry<T>(operation: (db: any, isClient: boolean) => Promise<T>, maxRetries = 5): Promise<T> {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Try Admin SDK first
      console.log(`[withRetry] Attempt ${i + 1} using Admin SDK on database: ${currentDbId}`);
      return await operation(adminDb, false);
    } catch (error: any) {
      lastError = error;
      console.error(`Firestore Admin attempt ${i + 1} failed:`, error.message, 'Code:', error.code);
      if (error.details) console.error('Error Details:', error.details);
      
      // Retry on NOT_FOUND (5), UNAVAILABLE (14), PERMISSION_DENIED (7), or DEADLINE_EXCEEDED (4)
      const isRetryable = error.code === 5 || error.code === 14 || error.code === 7 || error.code === 4 ||
                          error.message?.includes('NOT_FOUND') || 
                          error.message?.includes('UNAVAILABLE') ||
                          error.message?.includes('PERMISSION_DENIED') ||
                          error.message?.includes('DEADLINE_EXCEEDED');
      
      if (isRetryable && i < maxRetries - 1) {
        // If we hit NOT_FOUND (5) on a named database, try switching to default
        // If we hit PERMISSION_DENIED (7), it might be a database-specific permission, so try switching too
        if ((error.code === 5 || error.code === 7) && currentDbId !== '(default)') {
          console.log(`Database ${currentDbId} returned error code ${error.code}. Trying (default) as fallback...`);
          currentDbId = '(default)';
          try {
            adminDb = initDb(currentDbId);
            clientDb = initClientDb(currentDbId);
          } catch (e) {
            console.error('Failed to switch database during retry:', e);
          }
        } else if (error.code === 5 && currentDbId === '(default)') {
          // If (default) is not found, try the configured one if we haven't already
          const configDbId = firebaseConfig.firestoreDatabaseId || '(default)';
          if (configDbId !== '(default)' && currentDbId !== configDbId) {
            console.log(`(default) not found. Trying configured database ${configDbId}...`);
            currentDbId = configDbId;
            adminDb = initDb(currentDbId);
            clientDb = initClientDb(currentDbId);
          }
        }
        
        const delay = Math.pow(2, i) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If Admin SDK fails all retries or is not retryable, try Client SDK as a last resort
      if (clientDb) {
        console.log(`Admin SDK failed. Attempting with Client SDK on database: ${currentDbId}...`);
        try {
          return await operation(clientDb, true);
        } catch (clientError: any) {
          console.error('Client SDK also failed:', clientError.message);
          
          // If client SDK says it's offline, try to re-initialize it
          if (clientError.message?.includes('offline')) {
            console.log('Client SDK reported offline. Re-initializing...');
            clientDb = initClientDb();
          }
          
          lastError = clientError;
        }
      }
      
      if (i === maxRetries - 1) {
        throw lastError;
      }
    }
  }
  throw lastError;
}

// Test the connection to the database
async function testAdminDb() {
  try {
    console.log(`Testing Firestore connection with Database ID: ${currentDbId}...`);
    await withRetry(async (db, isClient) => {
      if (isClient) {
        await getDoc(doc(db, 'health_check', 'ping'));
      } else {
        // Try a write as well
        await db.collection('health_check').doc('ping').set({ time: new Date().toISOString() });
        await db.collection('health_check').limit(1).get();
      }
    });
    console.log(`Firestore connection test successful with ${currentDbId}`);
    if (currentDbId !== databaseId) {
      console.warn(`WARNING: Using fallback database ${currentDbId} because the configured database ${databaseId} failed with permissions/not found errors.`);
    }
  } catch (error: any) {
    console.error(`Firestore connection test failed permanently for all databases: ${error.message}`);
    if (error.stack) console.error(error.stack);
  }
}
testAdminDb();

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
    const settingsSnap = await withRetry(async (db, isClient) => {
      if (isClient) {
        return await getDoc(doc(db, 'settings', 'general'));
      } else {
        return await db.collection('settings').doc('general').get();
      }
    });

    if (!settingsSnap.exists() || (typeof settingsSnap.exists === 'function' ? !settingsSnap.exists() : !settingsSnap.exists)) {
      await withRetry(async (db, isClient) => {
        const data = {
          siteName: 'Oplug',
          siteDescription: 'Fastest VTU Platform in Nigeria',
          announcement: 'Welcome to Oplug! Buy data and airtime at the cheapest rates.',
          referralBonus: 50,
          resellerUpgradeFee: 2000,
          contactEmail: 'support@oplug.com',
          contactPhone: '+2348000000000',
          whatsappNumber: '+2348000000000',
          minFundingAmount: 100,
          maxFundingAmount: 50000,
          smartUserPackageName: 'Smart User',
          resellerPackageName: 'Reseller',
          heroImage: 'https://images.unsplash.com/photo-1556157382-97dee2dcb756?auto=format&fit=crop&q=80&w=1000',
          updatedAt: isClient ? clientServerTimestamp() : admin.firestore.FieldValue.serverTimestamp()
        };
        
        if (isClient) {
          await setDoc(doc(db, 'settings', 'general'), data);
        } else {
          await db.collection('settings').doc('general').set(data);
        }
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
    const expiresAtMillis = Date.now() + 10 * 60 * 1000; // 10 minutes

    await withRetry(async (db, isClient) => {
      const data = {
        otp,
        expiresAt: isClient 
          ? new Date(expiresAtMillis) 
          : admin.firestore.Timestamp.fromMillis(expiresAtMillis),
        createdAt: isClient ? clientServerTimestamp() : admin.firestore.FieldValue.serverTimestamp()
      };
      
      if (isClient) {
        await setDoc(doc(db, 'otps', email), data);
      } else {
        await db.collection('otps').doc(email).set(data);
      }
    });

    console.log(`Attempting to send OTP to ${email} via Mailjet...`);
    const mailjetResponse = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAILJET_SENDER_EMAIL || 'obaofaaua@gmail.com', // Use env var or fallback
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
    console.log('Mailjet OTP response:', JSON.stringify(mailjetResponse.body));

    res.json({ status: 'success', message: 'OTP sent successfully' });
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    let message = 'Failed to send OTP';
    if (error.code === 7 || error.message?.includes('PERMISSION_DENIED')) {
      message = 'Database permission denied. This usually happens if Firebase is not correctly set up. Please click the "Setup Firebase" button in the AI Studio UI to fix this.';
    }
    res.status(500).json({ message, error: error.message });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

  try {
    const otpDoc = await withRetry(async (db, isClient) => {
      if (isClient) {
        return await getDoc(doc(db, 'otps', email));
      } else {
        return await db.collection('otps').doc(email).get();
      }
    });
    
    const exists = typeof otpDoc.exists === 'function' ? otpDoc.exists() : otpDoc.exists;
    if (!exists) return res.status(400).json({ message: 'Invalid or expired OTP' });

    const data = otpDoc.data();
    if (data?.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    
    // Handle both Date and Timestamp for expiresAt
    const expiresAt = data?.expiresAt?.toMillis ? data.expiresAt.toMillis() : 
                     (data?.expiresAt instanceof Date ? data.expiresAt.getTime() : 
                     (typeof data?.expiresAt === 'number' ? data.expiresAt : 0));

    if (Date.now() > expiresAt) return res.status(400).json({ message: 'OTP has expired' });

    // Mark as verified in users collection
    await withRetry(async (db, isClient) => {
      if (isClient) {
        const { query, collection, where, limit, getDocs, updateDoc } = await import('firebase/firestore');
        const q = query(collection(db, 'users'), where('email', '==', email), limit(1));
        const userSnapshot = await getDocs(q);
        if (!userSnapshot.empty) {
          await updateDoc(userSnapshot.docs[0].ref, { isPhoneVerified: true });
        }
      } else {
        const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();
        if (!userSnapshot.empty) {
          await userSnapshot.docs[0].ref.update({ isPhoneVerified: true });
        }
      }
    });

    // Delete OTP after successful verification
    await withRetry(async (db, isClient) => {
      if (isClient) {
        const { deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(db, 'otps', email));
      } else {
        await adminDb.collection('otps').doc(email).delete();
      }
    });

    res.json({ status: 'success', message: 'Verification successful' });
  } catch (error: any) {
    console.error('Verify OTP Error:', error);
    let message = 'Verification failed';
    if (error.code === 7 || error.message?.includes('PERMISSION_DENIED')) {
      message = 'Database permission denied. Please ensure Firebase is correctly set up.';
    }
    res.status(500).json({ message, error: error.message });
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

    console.log(`Attempting to send welcome email to ${email} via Mailjet...`);
    const result = await mailjet
      .post("send", { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: process.env.MAILJET_SENDER_EMAIL || "obaofaaua@gmail.com",
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
    console.log('Mailjet welcome email response:', JSON.stringify(result.body));
    res.json(result.body);
  } catch (error: any) {
    console.error('Mailjet Error:', error);
    res.status(500).json({ message: 'Email sending failed' });
  }
});

export default app;
