import { useState, useEffect } from 'react';
import { vtuService } from '../services/apiService';

export default function EducationPin() {
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [pins, setPins] = useState<any[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await vtuService.getServices();
        if (response.status === 'success') {
          setServices(response.data.education || []);
        }
      } catch (error) {
        console.error('Failed to fetch services', error);
      }
    };
    fetchServices();
  }, []);

  const handlePurchase = async () => {
    if (!selectedService || !quantity) {
      setMessage({ type: 'error', text: 'Please fill all fields' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    setPins([]);

    try {
      const response = await vtuService.buyEducationPin({
        serviceID: selectedService,
        quantity: Number(quantity)
      });

      if (response.status === 'success') {
        setMessage({ type: 'success', text: response.message });
        setPins(response.data.pins || []);
      } else {
        setMessage({ type: 'error', text: response.message || 'Transaction failed' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const selectedServiceData = services.find(s => s.serviceID === selectedService);
  const totalAmount = selectedServiceData ? Number(selectedServiceData.amount.replace(/[^0-9.]/g, '')) * Number(quantity) : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6">Buy Exams Pins</h2>
        
        {message.text && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Type</label>
            <select 
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Type</option>
              {services.map(s => (
                <option key={s.serviceID} value={s.serviceID}>{s.type} - ₦{s.amount}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input 
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
            <input 
              type="text"
              value={`₦${totalAmount.toLocaleString()}`}
              disabled
              className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
            />
          </div>

          <button 
            onClick={handlePurchase}
            disabled={loading || !selectedService}
            className="w-full bg-blue-700 text-white font-bold py-4 rounded-xl hover:bg-blue-800 transition-colors shadow-lg shadow-blue-100 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Buy Pin'}
          </button>
        </div>
      </div>

      {pins.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold mb-4">Purchased Pins</h3>
          <div className="space-y-3">
            {pins.map((p, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm font-mono"><span className="font-bold">PIN:</span> {p.pin}</p>
                <p className="text-sm font-mono"><span className="font-bold">Serial:</span> {p.serialNo}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
