import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PinModal from '../components/PinModal';
import ProcessingModal from '../components/ProcessingModal';

export default function P2PTransfer() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(false);

  // PIN & Processing states
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSetupPinModal, setShowSetupPinModal] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [processMessage, setProcessMessage] = useState('');

  const handleTransfer = () => {
    if (!phone || !amount) {
      alert('Please fill all fields');
      return;
    }

    if (!profile?.isPinSet) {
      setShowSetupPinModal(true);
      return;
    }

    setShowPinModal(true);
  };

  const executeTransfer = async () => {
    setLoading(true);
    setShowProcessing(true);
    setProcessStatus('processing');
    setProcessMessage('Processing your transfer...');

    try {
      // Mock transfer logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setProcessStatus('success');
      setProcessMessage(`Successfully transferred ₦${amount} to ${phone}`);
      setPhone('');
      setAmount('');
      setRemark('');
    } catch (error) {
      setProcessStatus('error');
      setProcessMessage('Transfer failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6">P2P Transfer</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Receiver's Phone Number</label>
            <div className="flex gap-2">
              <input 
                type="tel"
                placeholder="eg: 08060689559"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="bg-blue-700 text-white px-6 py-3 rounded-xl text-xs font-bold">Verify</button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input 
              type="number"
              placeholder="eg: 500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
            <input 
              type="text"
              placeholder="Remark (Optional)"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button 
            onClick={handleTransfer}
            disabled={loading}
            className="w-full bg-blue-700 text-white font-bold py-4 rounded-xl hover:bg-blue-800 transition-colors shadow-lg shadow-blue-100 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Transfer'}
          </button>
        </div>
      </div>

      {/* PIN Verification Modal */}
      <PinModal 
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={executeTransfer}
        correctPin={profile?.transactionPin}
        mode="verify"
        title="Verify Transfer"
        description={`Enter your 5-digit PIN to authorize ₦${amount} transfer to ${phone}`}
      />

      {/* Setup PIN Modal */}
      <PinModal 
        isOpen={showSetupPinModal}
        onClose={() => setShowSetupPinModal(false)}
        onSuccess={() => navigate('/profile')}
        mode="verify"
        title="PIN Required"
        description="You need to set a transaction PIN before you can make transfers. Would you like to set it now?"
      />

      {/* Processing Modal */}
      <ProcessingModal 
        isOpen={showProcessing}
        onClose={() => setShowProcessing(false)}
        status={processStatus}
        message={processMessage}
      />
    </div>
  );
}
