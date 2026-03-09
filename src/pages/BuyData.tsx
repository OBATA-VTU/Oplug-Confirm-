import { useState, useEffect } from 'react';
import { vtuService } from '../services/apiService';

export default function BuyData() {
  const [services, setServices] = useState<any[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<any[]>([]);
  const [network, setNetwork] = useState('');
  const [type, setType] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await vtuService.getServices();
        if (response.status === 'success') {
          setServices(response.data.dataPlans || []);
        }
      } catch (error) {
        console.error('Failed to fetch services', error);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (network) {
      const plans = services.filter(p => p.network.toLowerCase() === network.toLowerCase());
      const uniqueTypes = Array.from(new Set(plans.map(p => p.dataType)));
      // If type is not in uniqueTypes, reset it
      if (type && !uniqueTypes.includes(type)) {
        setType('');
      }
      
      let finalPlans = plans;
      if (type) {
        finalPlans = plans.filter(p => p.dataType === type);
      }
      setFilteredPlans(finalPlans);
    } else {
      setFilteredPlans([]);
    }
  }, [network, type, services]);

  const handlePurchase = async () => {
    if (!selectedPlan || !phone) {
      setMessage({ type: 'error', text: 'Please fill all fields' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await vtuService.buyData({
        serviceID: selectedPlan,
        mobileNumber: phone
      });

      if (response.status === 'success') {
        setMessage({ type: 'success', text: response.message });
        setPhone('');
      } else {
        setMessage({ type: 'error', text: response.message || 'Transaction failed' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const networks = Array.from(new Set(services.map(s => s.network)));
  const types = network ? Array.from(new Set(services.filter(s => s.network.toLowerCase() === network.toLowerCase()).map(s => s.dataType))) : [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-amber-50 border border-amber-100 rounded-3xl p-4">
        <p className="text-amber-800 text-[10px] sm:text-xs text-center font-medium">
          <span className="font-bold">Important Notice:</span> Please, don't send Airtel Awoof and Gifting to any number owing Airtel. It will not deliver and you will not be refunded. Thank you for choosing Oplug.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6">Buy Data</h2>
        
        {message.text && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Network</label>
            <select 
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Network</option>
              {networks.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Type</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Type</option>
              {types.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Plan</label>
            <select 
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Plan</option>
              {filteredPlans.map(p => (
                <option key={p.serviceID} value={p.serviceID}>{p.dataPlan} - ₦{p.amount} ({p.validity})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input 
              type="tel"
              placeholder="eg: 07066778800"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button 
            onClick={handlePurchase}
            disabled={loading}
            className="w-full bg-blue-700 text-white font-bold py-4 rounded-xl hover:bg-blue-800 transition-colors shadow-lg shadow-blue-100 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Buy Data'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold mb-4">Codes for Data Balance</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>MTN [SME] <span className="text-blue-700 font-bold">*461*4#</span></li>
          <li>MTN [Corporate] <span className="text-blue-700 font-bold">*460*260#</span></li>
          <li>MTN [Gifting] <span className="text-blue-700 font-bold">*323#</span></li>
          <li>9mobile <span className="text-blue-700 font-bold">*323#</span></li>
          <li>Airtel <span className="text-blue-700 font-bold">*323#</span></li>
          <li>Glo <span className="text-blue-700 font-bold">*323#</span></li>
        </ul>
      </div>
    </div>
  );
}
