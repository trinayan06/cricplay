import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ShieldCheck, ArrowRight, Loader2, Smartphone, CheckCircle, XCircle, Lock } from 'lucide-react';
import { BASE_URL } from '@/src/lib/api';

export default function Verify() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const { token, updateUser } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/api/auth/verify`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (res.ok) {
        updateUser({ is_verified: 1 });
        localStorage.setItem('token', data.token); // Update token with verified status
        navigate('/');
      } else {
        setError(data.error || 'Invalid Verification Code');
      }
    } catch (err) {
      setError('System connection failure. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8f5f0] font-sans overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] -ml-48 -mb-48" />

      <div className="w-full max-w-md bg-white p-10 rounded-[3rem] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.08)] border border-black/[0.03] relative z-10 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] text-center">
        <div className="flex justify-center mb-8 relative">
          <div className="w-20 h-20 bg-[#ede9fe] rounded-[2rem] flex items-center justify-center shadow-xl shadow-purple-500/10 rotate-3 border border-purple-100 p-5 group hover:rotate-0 transition-transform duration-500">
            <ShieldCheck className="w-full h-full text-[#7c3aed]" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-md border border-black/5">
            <Lock className="w-5 h-5 text-[#6366f1]" />
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-[#1e1b4b] mb-3 tracking-tight uppercase italic leading-none">Security Access</h2>
        <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.15em] mb-10 leading-relaxed px-4 opacity-80">Enter the secret invite code provided <br/>to unlock your CRICPLAY dashboard.</p>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 p-4 rounded-2xl mb-8 text-[11px] font-black uppercase tracking-widest text-center shadow-sm animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="group relative">
             <div className="absolute inset-0 bg-gradient-to-r from-[#7c3aed] to-[#6366f1] rounded-2xl blur-lg opacity-0 group-focus-within:opacity-10 transition-opacity" />
            <input
              type="text"
              required
              placeholder="0 0 0 - 0 0 0"
              className="relative w-full bg-[#f8f5f0]/50 border border-black/5 rounded-2xl px-6 py-5 text-center text-3xl font-black tracking-[0.3em] text-[#1e1b4b] focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 focus:bg-white transition-all shadow-inner placeholder:text-slate-200 uppercase"
              value={code}
              onChange={e => setCode(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-[#7c3aed] to-[#6366f1] hover:brightness-110 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-purple-500/25 mt-4 flex items-center justify-center gap-3 active:scale-95 uppercase tracking-[0.2em] text-[11px]"
          >
            Authenticate Squad
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
        
        <div className="mt-10 pt-8 border-t border-black/[0.03]">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Encrypted Secure Access • CRICPLAY OS V2.0</p>
        </div>
      </div>
    </div>
  );
}
