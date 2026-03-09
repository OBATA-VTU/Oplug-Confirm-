import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Bell, Send, Trash2, Megaphone, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newNotif, setNewNotif] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'promo' | 'alert'
  });

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setNotifications(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleSend = async () => {
    if (!newNotif.title || !newNotif.message) return;
    setSending(true);
    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...newNotif,
        createdAt: serverTimestamp()
      });
      setNotifications([{ id: docRef.id, ...newNotif, createdAt: { toDate: () => new Date() } }, ...notifications]);
      setNewNotif({ title: '', message: '', type: 'info' });
    } catch (err) {
      console.error('Error sending notification:', err);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  if (loading) return <div>Loading notifications...</div>;

  return (
    <div className="space-y-8 max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight">Promotional Offers & Notifications</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6 h-fit">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-700" />
            Send New Notification
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Title</label>
              <input 
                type="text" 
                value={newNotif.title}
                onChange={(e) => setNewNotif({...newNotif, title: e.target.value})}
                placeholder="e.g. Weekend Data Promo!"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Type</label>
              <div className="flex gap-2">
                {[
                  { id: 'info', label: 'Info', icon: Info, color: 'text-blue-600 bg-blue-50' },
                  { id: 'promo', label: 'Promo', icon: Megaphone, color: 'text-emerald-600 bg-emerald-50' },
                  { id: 'alert', label: 'Alert', icon: AlertTriangle, color: 'text-orange-600 bg-orange-50' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setNewNotif({...newNotif, type: t.id as any})}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all border",
                      newNotif.type === t.id ? "border-blue-500 ring-2 ring-blue-100" : "border-transparent bg-gray-50 text-gray-500"
                    )}
                  >
                    <t.icon className="w-4 h-4" />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Message</label>
              <textarea 
                value={newNotif.message}
                onChange={(e) => setNewNotif({...newNotif, message: e.target.value})}
                placeholder="Enter notification message..."
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
              />
            </div>
            <button 
              onClick={handleSend}
              disabled={sending}
              className="w-full bg-blue-700 text-white font-bold py-4 rounded-2xl hover:bg-blue-800 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {sending ? 'Sending...' : 'Broadcast Notification'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2 px-2">
            <Bell className="w-5 h-5 text-gray-400" />
            Recent Broadcasts
          </h3>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
            {notifications.map((notif) => (
              <div key={notif.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative group">
                <button 
                  onClick={() => handleDelete(notif.id)}
                  className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                    notif.type === 'promo' ? "bg-emerald-50 text-emerald-600" : 
                    notif.type === 'alert' ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
                  )}>
                    {notif.type === 'promo' ? <Megaphone className="w-5 h-5" /> : 
                     notif.type === 'alert' ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-sm">{notif.title}</h4>
                      <span className="text-[10px] text-gray-400">{new Date(notif.createdAt?.toDate()).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{notif.message}</p>
                  </div>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="p-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 text-sm font-bold">No notifications sent yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
