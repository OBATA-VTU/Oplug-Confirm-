import { useState, useEffect } from 'react';
import { vtuService } from '../services/apiService';

export default function ElectricityPayment() {
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState('');
  const [meterNum, setMeterNum] = useState('');
  const [meterType, setMeterType] = useState('1'); // 1=prepaid, 2=postpaid
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await vtuService.getServices();
        if (response.status === 'success') {
          setServices(response.data.electricity || []);
        }
      } catch (error) {
        console.error('Failed to fetch services', error);
      }
    };
    fetchServices();
  }, []);

  const handleValidate = async () => {
    if (!selectedService || !meterNum) {
      setMessage({ type: 'error', text: 'Please select disco and enter meter number' });
      return;
    }

    setValidating(true);
    setMessage({ type: '', text: '' });
    setCustomerName('');

    try {
      const response = await vtuService.validateMeter({
        serviceID: selectedService,
        meterNum: meterNum,
        meterType: Number(meterType)
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
    if (!selectedService || !meterNum || !amount) {
      setMessage({ type: 'error', text: 'Please fill all fields' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await vtuService.payElectricity({
        serviceID: selectedService,
        meterNum: meterNum,
        meterType: Number(meterType),
        amount: Number(amount)
      });

      if (response.status === 'success') {
        setMessage({ type: 'success', text: response.message + (response.data.token ? ` Token: ${response.data.token}` : '') });
        setMeterNum('');
        setAmount('');
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6">Electricity Payment</h2>
        
        {message.text && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Disco</label>
            <select 
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Disco</option>
              {services.map(s => (
                <option key={s.serviceID} value={s.serviceID}>{s.disco}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meter Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="meterType" 
                  value="1" 
                  checked={meterType === '1'} 
                  onChange={(e) => setMeterType(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">Prepaid</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="meterType" 
                  value="2" 
                  checked={meterType === '2'} 
                  onChange={(e) => setMeterType(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">Postpaid</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meter Number</label>
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="eg: 07364853244533"
                value={meterNum}
                onChange={(e) => setMeterNum(e.target.value)}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input 
              type="number"
              placeholder="eg: 2000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button 
            onClick={handlePurchase}
            disabled={loading || !customerName}
            className="w-full bg-blue-700 text-white font-bold py-4 rounded-xl hover:bg-blue-800 transition-colors shadow-lg shadow-blue-100 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Pay Bill'}
          </button>
        </div>
      </div>
    </div>
  );
}
