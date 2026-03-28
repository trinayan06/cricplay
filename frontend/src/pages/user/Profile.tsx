import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ChevronLeft, Mail, Phone, Trophy, Calendar, LogOut, Verified, ShieldQuestion, CheckCircle, Loader2 } from 'lucide-react';
import BottomNav from '../../components/BottomNav';
import { BASE_URL } from '@/src/lib/api';

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [teams, setTeams] = useState<Record<string, string>>({});
  const { token, logout } = useAuthStore();

  useEffect(() => {
    Promise.all([
      fetch(`${BASE_URL}/api/user/profile`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
      fetch(`${BASE_URL}/api/teams`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json())
    ]).then(([profileData, teamsData]) => {
      setProfile(profileData || null);
      setTeams(teamsData || {});
    }).catch(err => {
      console.error('Profile Fetch Error:', err);
    });
  }, [token]);

  if (!profile) return <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center text-[#1e1b4b] font-black italic uppercase tracking-widest">Loading Profile...</div>;

  const { user, history } = profile;

  return (
    <div className="min-h-screen bg-[#f8f5f0] pb-36 font-sans overflow-x-hidden">
      <header className="bg-white/90 backdrop-blur-xl border-b border-black/5 sticky top-0 z-30 transition-all">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="w-9 h-9 flex items-center justify-center bg-[#f8f5f0] rounded-full text-slate-400 hover:text-[#7c3aed] transition-all border border-black/5">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-black text-[#1e1b4b] tracking-tighter uppercase italic">My Account</h1>
          </div>
          <button onClick={logout} className="w-10 h-10 bg-red-50 text-red-500 rounded-xl border border-red-100 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm group">
            <LogOut className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-5 space-y-8">
        {/* User Identity Card */}
        <section className="relative bg-white border border-black/5 rounded-[2.5rem] p-8 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#7c3aed]/5 rounded-full blur-[60px] -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#6366f1]/5 rounded-full blur-[50px] -ml-12 -mb-12" />
          
          <div className="flex items-center gap-6 mb-8 relative z-10">
            <div className="relative group">
              <div className="w-20 h-20 bg-gradient-to-tr from-[#7c3aed] to-[#6366f1] rounded-[1.75rem] flex items-center justify-center shadow-xl shadow-purple-500/20 border-4 border-white transform transition-transform group-hover:rotate-6 duration-500">
                <span className="text-3xl font-black text-white italic">{user.name.substring(0, 1).toUpperCase()}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md border border-black/5">
                {user.is_verified ? <Verified className="w-4 h-4 text-[#7c3aed]" /> : <ShieldQuestion className="w-4 h-4 text-amber-500" />}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#1e1b4b] tracking-tight uppercase italic leading-none">{user.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                {user.is_verified ? (
                  <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-100 flex items-center gap-1 shadow-sm">
                    <CheckCircle className="w-3 h-3" /> PRO ACCOUNT
                  </span>
                ) : (
                  <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-100 shadow-sm">UNVERIFIED USER</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-4 text-[#1e1b4b] bg-[#f8f5f0]/50 p-4 rounded-2xl border border-black/[0.03] shadow-inner group hover:bg-white hover:shadow-lg transition-all duration-300">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm border border-black/5 group-hover:scale-110 transition-transform">
                <Mail className="w-4 h-4 text-[#6366f1]" />
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Email Address</p>
                <span className="text-sm font-black tracking-tight">{user.email}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[#1e1b4b] bg-[#f8f5f0]/50 p-4 rounded-2xl border border-black/[0.03] shadow-inner group hover:bg-white hover:shadow-lg transition-all duration-300">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm border border-black/5 group-hover:scale-110 transition-transform">
                <Phone className="w-4 h-4 text-[#7c3aed]" />
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Mobile Contact</p>
                <span className="text-sm font-black tracking-tight">+91 {user.phone}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Career Stats / Match History */}
        <section className="space-y-5">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black text-[#1e1b4b] uppercase tracking-widest flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Trophy className="w-4 h-4 text-blue-500" />
              </div>
              Match History
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-black/5 shadow-sm">
              {history.length} Games
            </span>
          </div>
          
          <div className="space-y-4">
            {history.map((match: any) => (
              <Link 
                key={match.id} 
                to={`/leaderboard/${match.id}`} 
                className="block bg-white border border-black/5 rounded-[2rem] overflow-hidden hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.08)] transition-all hover:scale-[1.02] shadow-sm group active:scale-95 duration-500"
              >
                <div className="bg-[#f8f5f0]/50 px-6 py-3 flex justify-between items-center border-b border-black/[0.03]">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Calendar className="w-3.5 h-3.5 text-[#6366f1]" /> {match.date}
                  </div>
                  <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.15em] border ${match.status === 'live' ? 'bg-red-50 text-red-500 border-red-100 animate-pulse' : match.status === 'completed' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-blue-50 text-blue-500 border-blue-100'}`}>
                    {match.status}
                  </span>
                </div>
                
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      <div className="w-11 h-11 rounded-full bg-white border border-black/5 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform p-1.5 overflow-hidden">
                        {teams[match.team1] ? <img src={teams[match.team1]} className="w-full h-full object-contain" /> : <span className="text-[10px] font-black italic">{match.team1.substring(0,2)}</span>}
                      </div>
                      <div className="w-11 h-11 rounded-full bg-white border border-black/5 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform p-1.5 overflow-hidden">
                        {teams[match.team2] ? <img src={teams[match.team2]} className="w-full h-full object-contain" /> : <span className="text-[10px] font-black italic">{match.team2.substring(0,2)}</span>}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#1e1b4b] uppercase tracking-tight italic group-hover:text-[#7c3aed] transition-colors">
                        {match.team1} <span className="text-slate-300 not-italic mx-0.5">vs</span> {match.team2}
                      </h4>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">League Entry Secured</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-[9px] text-[#6366f1] font-black uppercase tracking-widest mb-1 tabular-nums">SCORE</p>
                    <p className="font-black text-2xl text-[#1e1b4b] tracking-tighter tabular-nums leading-none">{match.points}</p>
                  </div>
                </div>
              </Link>
            ))}

            {history.length === 0 && (
              <div className="text-center py-16 bg-white border border-black/5 rounded-[2.5rem] shadow-sm">
                <div className="w-16 h-16 bg-[#f8f5f0] rounded-full flex items-center justify-center mx-auto mb-4 border border-black/5 shadow-inner">
                  <Trophy className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic">No match history found</p>
                <Link to="/" className="text-[#7c3aed] text-[10px] font-black uppercase tracking-widest mt-3 inline-block hover:brightness-110 border-b-2 border-purple-100 pb-0.5">Start Playing Now</Link>
              </div>
            )}
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
