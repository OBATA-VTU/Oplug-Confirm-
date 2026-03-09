import axios from 'axios';

export const vtuService = {
  async getBalance() {
    const response = await axios.get('/api/vtu/balance');
    return response.data;
  },

  async getServices() {
    const response = await axios.get('/api/vtu/services');
    return response.data;
  },

  async buyAirtime(data: { serviceID: string; amount: number; mobileNumber: string }) {
    const response = await axios.post('/api/vtu/airtime', data);
    return response.data;
  },

  async buyData(data: { serviceID: string; mobileNumber: string }) {
    const response = await axios.post('/api/vtu/data', data);
    return response.data;
  },

  async validateCable(data: { serviceID: string; iucNum: string }) {
    const response = await axios.post('/api/vtu/validate-cable', data);
    return response.data;
  },

  async buyCable(data: { serviceID: string; iucNum: string }) {
    const response = await axios.post('/api/vtu/cable', data);
    return response.data;
  },

  async validateMeter(data: { serviceID: string; meterNum: string; meterType: number }) {
    const response = await axios.post('/api/vtu/validate-meter', data);
    return response.data;
  },

  async payElectricity(data: { serviceID: string; meterNum: string; meterType: number; amount: number }) {
    const response = await axios.post('/api/vtu/electricity', data);
    return response.data;
  },

  async buyEducationPin(data: { serviceID: string; quantity: number }) {
    const response = await axios.post('/api/vtu/education', data);
    return response.data;
  }
};

export const smmService = {
  async getServices() {
    const response = await axios.post('/api/smm/action', { action: 'services' });
    return response.data;
  },

  async addOrder(data: { service: number; link: string; quantity: number }) {
    const response = await axios.post('/api/smm/action', {
      action: 'add',
      ...data
    });
    return response.data;
  },

  async getStatus(orderId: number) {
    const response = await axios.post('/api/smm/action', {
      action: 'status',
      order: orderId
    });
    return response.data;
  },

  async getBalance() {
    const response = await axios.post('/api/smm/action', { action: 'balance' });
    return response.data;
  }
};

export const fundingService = {
  async generateVirtualAccount(data: { email: string; reference: string; firstName: string; lastName: string; phone: string; bank: string }) {
    const response = await axios.post('/api/funding/generate-account', data);
    return response.data;
  },

  async initializePaystack(data: { email: string; amount: number; reference: string }) {
    const response = await axios.post('/api/funding/paystack-initialize', data);
    return response.data;
  }
};
