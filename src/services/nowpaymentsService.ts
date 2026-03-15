import axios from 'axios';

export const nowpaymentsService = {
  // Get API Status
  getStatus: async () => {
    const response = await axios.get('/api/crypto/status');
    return response.data;
  },

  // Get available currencies
  getCurrencies: async () => {
    const response = await axios.get('/api/crypto/currencies');
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
    const response = await axios.post('/api/crypto/payment', data);
    return response.data;
  },

  // Get payment status
  getPaymentStatus: async (paymentId: string) => {
    const response = await axios.get(`/api/crypto/payment/${paymentId}`);
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
    const response = await axios.post('/api/crypto/invoice', data);
    return response.data;
  },

  // Estimate price
  getEstimate: async (amount: number, from: string, to: string) => {
    const response = await axios.get(`/api/crypto/estimate`, {
      params: { amount, currency_from: from, currency_to: to }
    });
    return response.data;
  }
};
