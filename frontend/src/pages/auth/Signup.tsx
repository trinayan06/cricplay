import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Trophy, Mail, Lock, User, Phone, UserPlus, ChevronRight, Loader2, ShieldCheck, X } from 'lucide-react';
import { BASE_URL } from '@/src/lib/api';

export default function Signup() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const setAuth = useAuthStore(state => state.setAuth);
  const navigate = useNavigate();

  const handleClosePopup = () => {
    setShowPopup(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    navigate('/verify');
  };

  useEffect(() => {
    const audio = new Audio(encodeURI("/welcome.mp3"));
    audio.load();
    audioRef.current = audio;

    if (showPopup) {
      const timer = setTimeout(handleClosePopup, 5000);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.error("Audio play failed:", err));
    }

    try {
      // Sync with Supabase Database
      const supabaseRes = await fetch(`${BASE_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone })
      });

      if (!supabaseRes.ok) {
        console.error("Supabase sync failed");
      }

      // Authenticate with local backend
      const res = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setAuth(data.user, data.token);
        setShowPopup(true);
      } else {
        setError(data.error || 'Signup failed. Please check your details.');
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      }
    } catch (err) {
      setError('Connection failure. Please try again.');
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8f5f0] font-sans overflow-hidden relative">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] -ml-48 -mt-48" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -mr-48 -mb-48" />
      
      <div className="w-full max-w-md bg-white p-10 rounded-[3rem] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.08)] border border-black/[0.03] relative z-10 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-[#7c3aed] to-[#6366f1] rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-purple-500/20 transform hover:scale-110 transition-transform">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-[#1e1b4b] tracking-tighter uppercase italic">CRICPLAY</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3">Join the Elite League</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 p-4 rounded-2xl mb-6 text-[11px] font-black uppercase tracking-widest text-center shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="group">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Identity (Name)</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-[#f8f5f0] flex items-center justify-center border border-black/5 group-focus-within:border-purple-200 transition-all">
                <User className="w-4 h-4 text-[#7c3aed]" />
              </div>
              <input 
                type="text" 
                required 
                placeholder="Ex: Virat Kohli"
                className="w-full bg-[#f8f5f0]/50 border border-black/5 rounded-2xl py-3.5 pl-14 pr-4 text-[#1e1b4b] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:bg-white transition-all font-bold text-sm shadow-inner" 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>
          </div>
          <div className="group">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mobile Contact</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-[#f8f5f0] flex items-center justify-center border border-black/5 group-focus-within:border-purple-200 transition-all">
                <Phone className="w-4 h-4 text-[#6366f1]" />
              </div>
              <input 
                type="tel" 
                required 
                placeholder="10 digit number"
                className="w-full bg-[#f8f5f0]/50 border border-black/5 rounded-2xl py-3.5 pl-14 pr-4 text-[#1e1b4b] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:bg-white transition-all font-bold text-sm shadow-inner" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
              />
            </div>
          </div>
          <div className="group">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Official Email</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-[#f8f5f0] flex items-center justify-center border border-black/5 group-focus-within:border-purple-200 transition-all">
                <Mail className="w-4 h-4 text-[#7c3aed]" />
              </div>
              <input 
                type="email" 
                required 
                placeholder="you@domain.com"
                className="w-full bg-[#f8f5f0]/50 border border-black/5 rounded-2xl py-3.5 pl-14 pr-4 text-[#1e1b4b] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:bg-white transition-all font-bold text-sm shadow-inner" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>
          </div>
          <div className="group">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Secure Password</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-[#f8f5f0] flex items-center justify-center border border-black/5 group-focus-within:border-purple-200 transition-all">
                <Lock className="w-4 h-4 text-[#6366f1]" />
              </div>
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                className="w-full bg-[#f8f5f0]/50 border border-black/5 rounded-2xl py-3.5 pl-14 pr-4 text-[#1e1b4b] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:bg-white transition-all font-bold text-sm shadow-inner" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-[#7c3aed] to-[#6366f1] hover:brightness-110 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-purple-500/25 mt-6 flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest text-xs"
          >
            <UserPlus className="w-5 h-5" />
            Create Account
          </button>
        </form>
        
        <div className="mt-8 pt-8 border-t border-black/[0.03]">
          <p className="text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">
            Already recorded? <Link to="/login" className="text-[#7c3aed] hover:brightness-110 ml-1 inline-flex items-center gap-1 group">Sign In <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" /></Link>
          </p>
        </div>
      </div>

      {/* Welcome Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#1e1b4b]/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white border border-black/5 p-10 rounded-[3rem] shadow-2xl max-w-sm w-full text-center relative overflow-hidden animate-in zoom-in duration-300">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#7c3aed] animate-pulse" />
            
            <button 
              onClick={handleClosePopup}
              className="absolute top-6 right-6 w-9 h-9 bg-[#f8f5f0] text-slate-400 hover:text-red-500 rounded-full flex items-center justify-center transition-colors border border-black/5 shadow-inner"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-24 h-24 bg-[#ede9fe] rounded-[2rem] flex items-center justify-center mb-8 mx-auto shadow-xl shadow-purple-500/10 rotate-12 p-4">
              <Trophy className="w-full h-full text-[#7c3aed]" />
            </div>

            <h2 className="text-2xl font-black text-[#1e1b4b] mb-3 uppercase tracking-tight italic">Registration Successful!</h2>
            <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest mb-10 leading-relaxed italic opacity-80">🔥 Welcome to the Squad. <br/>Your cricket empire starts now!</p>
            
            <button 
              onClick={handleClosePopup}
              className="w-full bg-gradient-to-r from-[#7c3aed] to-[#6366f1] hover:brightness-110 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-purple-500/25 active:scale-95 text-xs uppercase tracking-widest"
            >
              Let's Play!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
