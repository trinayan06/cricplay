import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { AdminLayout } from './AdminDashboard';
import { CheckCircle, XCircle, ExternalLink, CreditCard, User, History, Search, Loader2, Trash2, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BASE_URL } from '@/src/lib/api';

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const token = useAuthStore(state => state.token);

  const fetchPayments = () => {
    fetch(`${BASE_URL}/api/admin/payments`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setPayments(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error('Payments Fetch Error:', err);
        setPayments([]);
      });
  };

  useEffect(() => {
    fetchPayments();
  }, [token]);

  const handleStatusUpdate = async (id: number, status: string) => {
    await fetch(`${BASE_URL}/api/admin/payments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    fetchPayments();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await fetch(`${BASE_URL}/api/admin/payments/${deleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchPayments();
      setDeleteId(null);
    } catch (err) {
      console.error('Delete Error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
    <AdminLayout title="Capital Flow">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-[#1e1b4b] uppercase italic tracking-tight">Entry Authorizations</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Review and approve user contest payments</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="px-4 py-2 bg-white border border-black/5 rounded-2xl shadow-sm flex items-center gap-2">
             <History className="w-4 h-4 text-[#7c3aed]" />
             <span className="text-[10px] font-black text-[#1e1b4b] uppercase tracking-widest opacity-60">Real-time Ledger</span>
           </div>
        </div>
      </div>

      <div className="bg-white border border-black/5 rounded-[3rem] overflow-hidden shadow-[0_30px_70px_-20px_rgba(0,0,0,0.04)] mb-20 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#6366f1]/5 rounded-full blur-[80px] -mr-32 -mt-32" />
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f8f5f0]/30 border-b border-black/[0.03]">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Identity</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Fixture</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Reference ID</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Verification</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right pr-12">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03]">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-[#f8f5f0]/20 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#f8f5f0] rounded-xl flex items-center justify-center border border-black/5 shadow-inner">
                        <User className="w-5 h-5 text-slate-400" />
                      </div>
                      <p className="text-[#1e1b4b] font-black uppercase italic tracking-tight">{p.user_name}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                       <p className="text-[11px] font-black text-[#1e1b4b] tracking-tight">{p.team1} <span className="text-slate-200">v</span> {p.team2}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Premier Match</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#f8f5f0] rounded-lg border border-black/[0.03]">
                       <span className="text-[10px] font-black text-slate-500 font-mono tracking-tighter opacity-80">{p.transaction_id}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    {p.screenshot_url ? (
                      <a href={p.screenshot_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-[#6366f1] hover:bg-[#6366f1] hover:text-white rounded-xl transition-all border border-indigo-100 shadow-sm text-[9px] font-black uppercase tracking-widest">
                        Examine <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">No Asset</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                      p.status === 'approved' ? 'border-emerald-100 text-emerald-600 bg-emerald-50' :
                      p.status === 'rejected' ? 'border-red-100 text-red-500 bg-red-50' :
                      'border-amber-100 text-amber-600 bg-amber-50'
                    }`}>
                      {p.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right pr-12">
                     <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      {p.status === 'pending' ? (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(p.id, 'approved')} 
                            className="p-3 bg-white border border-black/5 text-emerald-500 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 rounded-xl transition-all shadow-sm active:scale-90"
                            title="Authorize Entry"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(p.id, 'rejected')} 
                            className="p-3 bg-white border border-black/5 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 rounded-xl transition-all shadow-sm active:scale-90"
                            title="Decline Entry"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-4">
                           <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Finalized</div>
                           <button 
                            onClick={() => setDeleteId(p.id)} 
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-100 shadow-sm active:scale-90 group/del"
                            title="Delete Entry"
                           >
                             <Trash2 className="w-4 h-4" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Delete</span>
                           </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-32 text-center">
                    <div className="w-20 h-20 bg-[#f8f5f0] rounded-full flex items-center justify-center mx-auto mb-6 border border-black/5 shadow-inner">
                      <CreditCard className="w-10 h-10 text-slate-200" />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] italic opacity-60">Authorizations Queue Empty</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>

    {/* Delete Confirmation Modal */}
    <AnimatePresence>
      {deleteId && (
        <div className="fixed inset-0 bg-[#1e1b4b]/60 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white border border-black/5 p-12 rounded-[3.5rem] w-full max-w-md shadow-2xl relative overflow-hidden text-center"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
            
            <button 
              onClick={() => setDeleteId(null)} 
              className="absolute top-8 right-8 w-11 h-11 bg-[#f8f5f0] text-slate-400 hover:text-red-500 rounded-full flex items-center justify-center transition-all border border-black/5 shadow-inner"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-red-100 shadow-inner">
               <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>

            <h3 className="text-2xl font-black text-[#1e1b4b] mb-4 uppercase tracking-tight italic">Terminal Action</h3>
            <p className="text-slate-500 text-sm font-bold mb-10 leading-relaxed px-4">
              Are you sure you want to delete this payment entry? This will permanently erase the transaction record and cannot be undone.
            </p>

            <div className="flex gap-4">
              <button 
                onClick={() => setDeleteId(null)}
                className="flex-1 px-6 py-4 rounded-2xl border border-black/5 text-slate-400 font-black uppercase tracking-widest text-[10px] transition-all hover:bg-[#f8f5f0]"
              >
                Abort
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-red-500/20 transition-all active:scale-95 uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Confirm Delete</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
}
