import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ChevronLeft, Upload, CheckCircle, Clock, IndianRupee, ShieldCheck, Loader2 } from 'lucide-react';
import { BASE_URL } from '@/src/lib/api';

export default function Contest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [transactionId, setTransactionId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    fetch(`${BASE_URL}/api/matches/${id}`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setMatch(data?.match || null))
      .catch(err => console.error('Match Fetch Error:', err));

    fetch(`${BASE_URL}/api/payments/${id}`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setPayment(data || null))
      .catch(err => console.error('Payment Fetch Error:', err));
  }, [id, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Please upload a screenshot');
    
    setUploading(true);
    const formData = new FormData();
    formData.append('match_id', id as string);
    formData.append('transaction_id', transactionId);
    formData.append('screenshot', file);

    const res = await fetch(`${BASE_URL}/api/payments`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (res.ok) {
      window.location.reload();
    } else {
      alert('Failed to submit payment');
      setUploading(false);
    }
  };

  if (!match) return <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center text-[#1e1b4b] font-black italic uppercase tracking-widest">Securing Gateway...</div>;

  return (
    <div className="min-h-screen bg-[#f8f5f0] pb-24 font-sans overflow-x-hidden">
      <header className="bg-white/90 backdrop-blur-xl border-b border-black/5 sticky top-0 z-30">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center gap-4">
          <Link to={`/match/${id}`} className="w-9 h-9 flex items-center justify-center bg-[#f8f5f0] rounded-full text-slate-400 hover:text-purple-600 transition-all border border-black/5">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-black text-[#1e1b4b] tracking-tighter uppercase italic">League Entry</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto p-5">
        <div className="relative bg-white border border-black/5 rounded-[2.5rem] p-8 mb-8 text-center shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-indigo-500" />
          
          <div className="mb-6">
            <h2 className="text-2xl font-black text-[#1e1b4b] uppercase italic tracking-tighter">Scan & Pay</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Pay entry fee via QR</p>
          </div>

          <div className="flex items-center justify-center gap-1 mb-6">
            <span className="text-2xl font-black text-[#6366f1] italic">₹</span>
            <p className="text-5xl font-black text-[#1e1b4b] tracking-tighter tabular-nums">{match.entry_fee}</p>
          </div>

          <div className="relative inline-block bg-[#f8f5f0] p-4 rounded-[2rem] mb-6 border border-black/[0.03] shadow-inner group-hover:scale-105 transition-transform duration-500">
             <div className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md border border-black/5 rotate-12 z-10">
               <ShieldCheck className="w-5 h-5 text-emerald-500" />
             </div>
             <img
               src={encodeURI("/images/qr-code.jpeg")}
               alt="Scan to Pay"
               className="w-full max-w-[250px] aspect-square object-contain mx-auto rounded-2xl shadow-md border-4 border-white"
             />
          </div>
          
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Scan with any Payment App</p>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100 mt-2">
              <span className="text-[9px] font-black uppercase tracking-widest">UPI ID:</span>
              <span className="text-[10px] font-black tracking-tight select-all">9864119506@fam</span>
            </div>
          </div>
        </div>

        {payment ? (
          <div className={`relative border rounded-[2.5rem] p-8 text-center shadow-lg transition-all ${
            payment.status === 'approved' ? 'bg-green-50/50 border-green-200' :
            payment.status === 'rejected' ? 'bg-red-50/50 border-red-200' :
            'bg-amber-50/50 border-amber-200 shadow-inner'
          }`}>
            {payment.status === 'approved' ? (
              <>
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl border border-green-100 rotate-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-xl font-black text-green-600 mb-2 uppercase tracking-tight italic">Verified!</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-8 leading-relaxed">Your entry has been secured. <br/>Good luck with your picks!</p>
                <Link to={`/leaderboard/${id}`} className="block w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:brightness-110 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-green-500/20 uppercase tracking-widest text-[10px]">
                  View Leaderboard
                </Link>
              </>
            ) : payment.status === 'rejected' ? (
              <>
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl border border-red-100 -rotate-6">
                  <span className="text-red-500 font-black text-2xl">!</span>
                </div>
                <h3 className="text-xl font-black text-red-600 mb-2 uppercase tracking-tight italic">Issue Found</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6 leading-relaxed">Your screenshot was rejected. <br/>Double check the details and try again.</p>
                <button onClick={() => setPayment(null)} className="w-full bg-white border border-red-200 text-red-500 font-black py-4 rounded-2xl hover:bg-red-50 transition-all uppercase tracking-widest text-[10px]">
                  Re-submit Payment
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl border border-amber-100 animate-bounce">
                  <Clock className="w-10 h-10 text-amber-500" />
                </div>
                <h3 className="text-xl font-black text-amber-600 mb-2 uppercase tracking-tight italic">In Queue</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Our team is verifying your payment screenshot. Check back in ~5 mins.</p>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-black/5 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-sm font-black text-[#1e1b4b] mb-6 uppercase tracking-widest italic">Verify Payout</h3>
            
            <div className="space-y-6">
              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">UTR / Transaction ID</label>
                <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#f8f5f0] flex items-center justify-center border border-black/5 group-focus-within:border-blue-200 transition-all">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                  </div>
                  <input 
                    type="text" 
                    required 
                    placeholder="12 digit number"
                    className="w-full bg-[#f8f5f0]/50 border border-black/5 rounded-2xl py-4 pl-14 pr-4 text-[#1e1b4b] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:bg-white transition-all font-bold text-sm shadow-inner"
                    value={transactionId}
                    onChange={e => setTransactionId(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Evidence (Screenshot)</label>
                <div className="relative border-2 border-dashed border-black/5 rounded-[2rem] p-8 text-center hover:border-[#7c3aed]/30 hover:bg-[#ede9fe]/10 transition-all bg-[#f8f5f0]/30 cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*" 
                    required 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                  />
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                    {file ? <span className="text-[#6366f1]">{file.name}</span> : <>Tap to pick <br/> image from gallery</>}
                  </p>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={uploading}
                className="w-full bg-gradient-to-r from-[#7c3aed] to-[#6366f1] hover:brightness-110 disabled:grayscale disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-purple-500/25 mt-4 flex items-center justify-center gap-3 active:scale-95 uppercase tracking-[0.2em] text-[10px]"
              >
                {uploading ? (
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Join Contest
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
