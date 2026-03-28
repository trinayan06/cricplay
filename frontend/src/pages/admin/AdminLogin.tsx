import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Shield, Lock, Mail, ChevronRight, Loader2 } from 'lucide-react';
import { BASE_URL } from '@/src/lib/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const setAuth = useAuthStore(state => state.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.user.is_admin === 1) {
        setAuth(data.user, data.token);
        navigate('/dnt/dashboard');
      } else {
        setError(data.error || 'Unauthorized Access Denied');
      }
    } catch (err) {
      setError('System connection failure');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8f5f0] font-sans overflow-hidden relative">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] -ml-48 -mt-48" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -mr-48 -mb-48" />

      <div className="w-full max-w-md bg-white p-10 rounded-[3rem] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.08)] border border-black/[0.03] relative z-10 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)]">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-[#ede9fe] rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-purple-500/10 rotate-3 border border-purple-100 p-5 group hover:rotate-0 transition-transform duration-500">
            <Shield className="w-full h-full text-[#7c3aed]" />
          </div>
          <h1 className="text-3xl font-black text-[#1e1b4b] tracking-tighter uppercase italic leading-none">Admin Console</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3">Secure Operator Gateway</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 p-4 rounded-2xl mb-8 text-[11px] font-black uppercase tracking-widest text-center shadow-sm animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Operator ID (Email)</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-[#f8f5f0] flex items-center justify-center border border-black/5 group-focus-within:border-purple-200 transition-all">
                <Mail className="w-4 h-4 text-[#7c3aed]" />
              </div>
              <input 
                type="email" 
                required 
                placeholder="admin@cricplay.com"
                className="w-full bg-[#f8f5f0]/50 border border-black/5 rounded-2xl py-4 pl-14 pr-5 text-[#1e1b4b] focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 focus:bg-white transition-all font-bold text-sm shadow-inner" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Security Key (Password)</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-[#f8f5f0] flex items-center justify-center border border-black/5 group-focus-within:border-purple-200 transition-all">
                <Lock className="w-4 h-4 text-[#6366f1]" />
              </div>
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                className="w-full bg-[#f8f5f0]/50 border border-black/5 rounded-2xl py-4 pl-14 pr-5 text-[#1e1b4b] focus:outline-none focus:ring-4 focus:ring-[#6366f1]/10 focus:bg-white transition-all font-bold text-sm shadow-inner" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-[#7c3aed] to-[#6366f1] hover:brightness-110 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-purple-500/25 mt-6 flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest text-xs"
          >
            Authorize Access
            <ChevronRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-black/[0.03] text-center">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic leading-relaxed">
            CRICPLAY Infrastructure <br/> 
            <span className="opacity-60">Authorized Personnel Only • IP Logged</span>
          </p>
        </div>
      </div>
    </div>
  );
}
