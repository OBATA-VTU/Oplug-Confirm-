import axios from 'axios';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs, writeBatch } from 'firebase/firestore';

export const vtuService = {
  async getBalance() {
    const response = await axios.get('/api/vtu/balance');
    return response.data;
  },

  async getServices() {
    // Try to get from Firestore first
    try {
      const snap = await getDoc(doc(db, 'cache', 'vtu_services'));
      if (snap.exists()) {
        const data = snap.data();
        const now = Date.now();
        // Cache for 1 hour
        if (now - data.timestamp < 3600000) {
          return data.services;
        }
      }
    } catch (err) {
      console.warn('Firestore cache read failed', err);
    }

    const response = await axios.get('/api/vtu/services');
    
    // Cache to Firestore
    try {
      await setDoc(doc(db, 'cache', 'vtu_services'), {
        services: response.data,
        timestamp: Date.now()
      });
    } catch (err) {
      console.warn('Firestore cache write failed', err);
    }

    return response.data;
  },

  async syncToFirestore() {
    const response = await axios.get('/api/vtu/services');
    const services = response.data;
    
    // Sync to collection for better querying
    const batch = writeBatch(db);
    const servicesCol = collection(db, 'vtu_services');
    
    // Clear existing or just update
    // For simplicity, we'll just set them
    if (Array.isArray(services)) {
      services.forEach((service: any) => {
        const docRef = doc(servicesCol, service.serviceID.toString());
        batch.set(docRef, {
          ...service,
          updatedAt: Date.now()
        });
      });
      await batch.commit();
    }

    // Also update the cache document for legacy support
    await setDoc(doc(db, 'cache', 'vtu_services'), {
      services: response.data,
      timestamp: Date.now()
    });
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
    // Try to get from Firestore first
    try {
      const snap = await getDoc(doc(db, 'cache', 'smm_services'));
      if (snap.exists()) {
        const data = snap.data();
        const now = Date.now();
        // Cache for 1 hour
        if (now - data.timestamp < 3600000) {
          return data.services;
        }
      }
    } catch (err) {
      console.warn('Firestore cache read failed', err);
    }

    const response = await axios.post('/api/smm/action', { action: 'services' });
    
    // Cache to Firestore
    try {
      await setDoc(doc(db, 'cache', 'smm_services'), {
        services: response.data,
        timestamp: Date.now()
      });
    } catch (err) {
      console.warn('Firestore cache write failed', err);
    }

    return response.data;
  },

  async syncToFirestore() {
    const response = await axios.post('/api/smm/action', { action: 'services' });
    const services = response.data;

    // Sync to collection
    const batch = writeBatch(db);
    const servicesCol = collection(db, 'smm_services');

    if (Array.isArray(services)) {
      services.forEach((service: any) => {
        const docRef = doc(servicesCol, service.service.toString());
        batch.set(docRef, {
          ...service,
          name: service.name.replace(/Ogaviral/gi, 'Oplug'),
          updatedAt: Date.now()
        });
      });
      await batch.commit();
    }

    await setDoc(doc(db, 'cache', 'smm_services'), {
      services: response.data,
      timestamp: Date.now()
    });
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
