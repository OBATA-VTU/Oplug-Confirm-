import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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
        callback_url: 'https://oplug.vercel.app/dashboard'
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
    // In a real app, verify the signature here
    const event = req.body;
    console.log('Webhook received:', event);
    
    // Logic to update user balance in Firestore based on event.type
    // e.g., 'charge.success' for Paystack or similar for Billstack
    
    res.status(200).send('OK');
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
