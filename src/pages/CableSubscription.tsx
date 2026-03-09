import { useState, useEffect } from 'react';
import { vtuService } from '../services/apiService';

export default function CableSubscription() {
  const [services, setServices] = useState<any[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<any[]>([]);
  const [cable, setCable] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [iuc, setIuc] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await vtuService.getServices();
        if (response.status === 'success') {
          setServices(response.data.cablePlans || []);
        }
      } catch (error) {
        console.error('Failed to fetch services', error);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (cable) {
      const plans = services.filter(p => p.cable.toLowerCase() === cable.toLowerCase());
      setFilteredPlans(plans);
    } else {
      setFilteredPlans([]);
    }
  }, [cable, services]);

  const handleValidate = async () => {
    if (!selectedPlan || !iuc) {
      setMessage({ type: 'error', text: 'Please select a plan and enter IUC number' });
      return;
    }

    setValidating(true);
    setMessage({ type: '', text: '' });
    setCustomerName('');

    try {
      const response = await vtuService.validateCable({
        serviceID: selectedPlan,
        iucNum: iuc
      });

      if (response.status === 'success') {
        setCustomerName(response.data.customerName);
        setMessage({ type: 'success', text: `Customer: ${response.data.customerName}` });
      } else {
        setMessage({ type: 'error', text: response.message || 'Validation failed' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'An error occurred' });
    } finally {
      setValidating(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPlan || !iuc) {
      setMessage({ type: 'error', text: 'Please fill all fields' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await vtuService.buyCable({
        serviceID: selectedPlan,
        iucNum: iuc
      });

      if (response.status === 'success') {
        setMessage({ type: 'success', text: response.message });
        setIuc('');
        setCustomerName('');
      } else {
        setMessage({ type: 'error', text: response.message || 'Transaction failed' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const cables = Array.from(new Set(services.map(s => s.cable)));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6">Cable Subscription</h2>
        
        {message.text && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Cable</label>
            <select 
              value={cable}
              onChange={(e) => setCable(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Cable</option>
              {cables.map(c => (
                <option key={c} value={c}>{c}</option>
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
                <option key={p.serviceID} value={p.serviceID}>{p.cablePlan} - ₦{p.amount}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enter IUC Number</label>
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="eg: 7027914329"
                value={iuc}
                onChange={(e) => setIuc(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={handleValidate}
                disabled={validating}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {validating ? '...' : 'Verify'}
              </button>
            </div>
          </div>

          {customerName && (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-700 font-bold">Customer: {customerName}</p>
            </div>
          )}

          <button 
            onClick={handlePurchase}
            disabled={loading || !customerName}
            className="w-full bg-blue-700 text-white font-bold py-4 rounded-xl hover:bg-blue-800 transition-colors shadow-lg shadow-blue-100 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Subscribe'}
          </button>
        </div>
      </div>
    </div>
  );
}
