import axios from 'axios';

const API_KEY = import.meta.env.VITE_NOWPAYMENTS_API_KEY;
const BASE_URL = 'https://api.nowpayments.io/v1';

const nowPaymentsApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'x-api-key': API_KEY,
    'Content-Type': 'application/json',
  },
});

export const nowpaymentsService = {
  // Get API Status
  getStatus: async () => {
    const response = await nowPaymentsApi.get('/status');
    return response.data;
  },

  // Get available currencies
  getCurrencies: async () => {
    const response = await nowPaymentsApi.get('/currencies?fixed_rate=true');
    return response.data;
  },

  // Create a payment (Funding)
  createPayment: async (data: {
    price_amount: number;
    price_currency: string;
    pay_currency: string;
    order_id: string;
    order_description: string;
    ipn_callback_url?: string;
    success_url?: string;
    cancel_url?: string;
  }) => {
    const response = await nowPaymentsApi.post('/payment', data);
    return response.data;
  },

  // Get payment status
  getPaymentStatus: async (paymentId: string) => {
    const response = await nowPaymentsApi.get(`/payment/${paymentId}`);
    return response.data;
  },

  // Create an invoice
  createInvoice: async (data: {
    price_amount: number;
    price_currency: string;
    order_id: string;
    order_description: string;
    ipn_callback_url?: string;
    success_url?: string;
    cancel_url?: string;
  }) => {
    const response = await nowPaymentsApi.post('/invoice', data);
    return response.data;
  },

  // Estimate price
  getEstimate: async (amount: number, from: string, to: string) => {
    const response = await nowPaymentsApi.get(`/estimate?amount=${amount}&currency_from=${from}&currency_to=${to}`);
    return response.data;
  }
};
