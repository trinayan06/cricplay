import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Users, Swords, IndianRupee, LogOut, LayoutDashboard, CreditCard, Youtube, Smartphone, CheckCircle, Clock, Edit2, Save, X, Trophy, ChevronRight, BarChart3, Loader2 } from 'lucide-react';
import { BASE_URL } from '@/src/lib/api';

export function AdminLayout({ children, title }: { children: React.ReactNode, title: string }) {
  const logout = useAuthStore(state => state.logout);

  return (
    <div className="min-h-screen bg-[#f8f5f0] flex font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-black/5 flex flex-col shadow-xl shadow-black/[0.02] sticky top-0 h-screen z-50">
        <div className="p-8 border-b border-black/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/10 border border-black/5 p-1.5">
              <img src="/logo.png" alt="CricPlay Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl font-black text-[#1e1b4b] uppercase tracking-tighter italic">
              CRICPLAY <span className="text-[10px] block not-italic font-bold text-slate-400 tracking-widest -mt-1">ADMIN-Trinayan, Das, Nikhil</span>
            </h1>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Console</p>
          <Link to="/dnt/dashboard" className="flex items-center justify-between group px-4 py-3.5 rounded-2xl hover:bg-[#f8f5f0] transition-all duration-300">
            <div className="flex items-center gap-3 text-[#1e1b4b] font-black text-sm uppercase tracking-tight italic opacity-70 group-hover:opacity-100 transition-opacity">
              <LayoutDashboard className="w-5 h-5 text-[#7c3aed]" /> Dashboard
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/dnt/matches" className="flex items-center justify-between group px-4 py-3.5 rounded-2xl hover:bg-[#f8f5f0] transition-all duration-300">
            <div className="flex items-center gap-3 text-[#1e1b4b] font-black text-sm uppercase tracking-tight italic opacity-70 group-hover:opacity-100 transition-opacity">
              <Swords className="w-5 h-5 text-[#6366f1]" /> Matches
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/dnt/payments" className="flex items-center justify-between group px-4 py-3.5 rounded-2xl hover:bg-[#f8f5f0] transition-all duration-300">
            <div className="flex items-center gap-3 text-[#1e1b4b] font-black text-sm uppercase tracking-tight italic opacity-70 group-hover:opacity-100 transition-opacity">
              <CreditCard className="w-5 h-5 text-emerald-500" /> Payments
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/dnt/users" className="flex items-center justify-between group px-4 py-3.5 rounded-2xl hover:bg-[#f8f5f0] transition-all duration-300">
            <div className="flex items-center gap-3 text-[#1e1b4b] font-black text-sm uppercase tracking-tight italic opacity-70 group-hover:opacity-100 transition-opacity">
              <Users className="w-5 h-5 text-blue-500" /> User Base
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/dnt/teams" className="flex items-center justify-between group px-4 py-3.5 rounded-2xl hover:bg-[#f8f5f0] transition-all duration-300">
            <div className="flex items-center gap-3 text-[#1e1b4b] font-black text-sm uppercase tracking-tight italic opacity-70 group-hover:opacity-100 transition-opacity">
              <BarChart3 className="w-5 h-5 text-orange-500" /> Team Logos
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </Link>
        </nav>

        <div className="p-6 border-t border-black/5 bg-[#f8f5f0]/30">
          <button onClick={logout} className="flex items-center gap-3 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 w-full px-4 py-3.5 rounded-2xl transition-all group">
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-black/5 p-8 flex items-center justify-between sticky top-0 z-40">
          <div>
            <h2 className="text-3xl font-black text-[#1e1b4b] tracking-tighter uppercase italic leading-none">{title}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 ml-1">Live Management Console</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
               System Online
             </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, matches: 0, revenue: 0 });
  const [preMatchUrl, setPreMatchUrl] = useState('');
  const [highlightUrl, setHighlightUrl] = useState('');
  const [videoMessage, setVideoMessage] = useState('');
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false);
  const [editingWithdrawal, setEditingWithdrawal] = useState<any>(null);
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setStats(data || { users: 0, matches: 0, revenue: 0 }))
      .catch(console.error);

    fetch(`${BASE_URL}/api/videos`)
      .then(res => res.json())
      .then(data => {
        if (data?.preMatchUrl) setPreMatchUrl(data.preMatchUrl);
        if (data?.highlightUrl) setHighlightUrl(data.highlightUrl);
      })
      .catch(console.error);

    fetchWithdrawals();
  }, [token]);

  const fetchWithdrawals = () => {
    setIsWithdrawLoading(true);
    fetch(`${BASE_URL}/api/admin/withdrawals`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setWithdrawals(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setIsWithdrawLoading(false));
  };

  const handleUpdateVideos = async () => {
    setIsVideoLoading(true);
    const cleanPre = preMatchUrl.trim().replace(/["']/g, '');
    const cleanHighlight = highlightUrl.trim().replace(/["']/g, '');

    try {
      const res = await fetch(`${BASE_URL}/api/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          preMatchUrl: cleanPre, 
          highlightUrl: cleanHighlight 
        })
      });
      if (res.ok) {
        setVideoMessage('Videos Updated Successfully');
      } else {
        setVideoMessage('Failed to update videos');
      }
    } catch (err) {
      setVideoMessage('Error updating videos');
    } finally {
      setIsVideoLoading(false);
      setTimeout(() => setVideoMessage(''), 3000);
    }
  };

  const handleUpdateWithdrawal = async (id: number, status: string) => {
    try {
      const body = editingWithdrawal ? { ...editingWithdrawal, status } : { status };
      const res = await fetch(`${BASE_URL}/api/admin/withdraw/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setEditingWithdrawal(null);
        fetchWithdrawals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout title="System Overview">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link to="/dnt/users" className="bg-white border border-black/5 p-8 rounded-[2.5rem] flex items-center gap-6 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06)] hover:scale-[1.02] transition-all cursor-pointer group shadow-sm">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
            <Users className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Active Users</p>
            <p className="text-4xl font-black text-[#1e1b4b] tabular-nums tracking-tighter">{stats.users}</p>
          </div>
        </Link>
        
        <Link to="/dnt/matches" className="bg-white border border-black/5 p-8 rounded-[2.5rem] flex items-center gap-6 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06)] hover:scale-[1.02] transition-all cursor-pointer group shadow-sm">
          <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
            <Swords className="w-8 h-8 text-[#7c3aed]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Total Fixtures</p>
            <p className="text-4xl font-black text-[#1e1b4b] tabular-nums tracking-tighter">{stats.matches}</p>
          </div>
        </Link>

        <Link to="/dnt/payments" className="bg-white border border-black/5 p-8 rounded-[2.5rem] flex items-center gap-6 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06)] hover:scale-[1.02] transition-all cursor-pointer group shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
            <IndianRupee className="w-8 h-8 text-emerald-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Platform Revenue</p>
            <p className="text-4xl font-black text-[#1e1b4b] tabular-nums tracking-tighter">₹{stats.revenue}</p>
          </div>
        </Link>
      </div>

      {/* Video Content Management */}
      <div className="mt-12 bg-white border border-black/5 rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#7c3aed]/5 rounded-full blur-[80px] -mr-32 -mt-32" />
        <h3 className="text-xl font-black text-[#1e1b4b] mb-8 uppercase tracking-tight italic flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shadow-sm">
            <Youtube className="w-6 h-6 text-red-500" />
          </div>
          Media Assets Configuration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pre-Match Analysis [YouTube URL]</label>
            <input 
              type="text" 
              className="w-full bg-[#f8f5f0]/50 border border-black/5 rounded-2xl px-5 py-4 text-[#1e1b4b] focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 focus:bg-white transition-all font-bold text-sm shadow-inner"
              value={preMatchUrl}
              onChange={e => setPreMatchUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Highlight Reel [YouTube URL]</label>
            <input 
              type="text" 
              className="w-full bg-[#f8f5f0]/50 border border-black/5 rounded-2xl px-5 py-4 text-[#1e1b4b] focus:outline-none focus:ring-4 focus:ring-[#6366f1]/10 focus:bg-white transition-all font-bold text-sm shadow-inner"
              value={highlightUrl}
              onChange={e => setHighlightUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic opacity-60">Changes will be visible to all users immediately upon update.</p>
          <div className="flex items-center gap-4">
             {videoMessage && (
               <span className={`text-[10px] font-black uppercase tracking-widest ${videoMessage.includes('Success') ? 'text-emerald-500' : 'text-red-500'}`}>
                 {videoMessage}
               </span>
             )}
             <button 
              onClick={handleUpdateVideos}
              disabled={isVideoLoading}
              className="bg-gradient-to-r from-[#7c3aed] to-[#6366f1] hover:brightness-110 disabled:grayscale disabled:opacity-50 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-purple-500/25 active:scale-95 uppercase tracking-widest text-[11px] flex items-center gap-2"
            >
              {isVideoLoading ? 'Processing...' : 'Sync Media Pipeline'}
            </button>
          </div>
        </div>
      </div>

      {/* Winners & Withdrawals Section */}
      <div className="mt-12 mb-20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-[#1e1b4b] uppercase tracking-tight italic flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shadow-sm">
              <Trophy className="w-6 h-6 text-amber-500" />
            </div>
            Payout Pipeline
          </h3>
          <button onClick={fetchWithdrawals} className="text-[10px] font-black text-[#7c3aed] uppercase tracking-widest hover:brightness-90 transition-all border-b-2 border-purple-100 pb-0.5">Refresh Queue</button>
        </div>
        
        <div className="bg-white border border-black/5 rounded-[3rem] overflow-hidden shadow-[0_30px_70px_-20px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#f8f5f0]/30 border-b border-black/[0.03]">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contestant</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payout Details</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gateway Info</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.03]">
                {withdrawals.map((req) => (
                  <tr key={req.id} className="hover:bg-[#f8f5f0]/20 transition-colors">
                    <td className="px-8 py-6">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm italic shadow-sm border ${
                        req.rank === 1 ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        req.rank === 2 ? 'bg-slate-50 text-slate-500 border-slate-100' :
                        req.rank === 3 ? 'bg-orange-50 text-orange-700 border-orange-100' :
                        'bg-blue-50 text-blue-500 border-blue-100'
                      }`}>
                        {req.rank}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-[#1e1b4b] font-black uppercase italic tracking-tight">{req.user_name}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{req.team1} <span className="text-slate-200">v</span> {req.team2}</p>
                    </td>
                    <td className="px-8 py-6 uppercase">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-black text-[#6366f1] italic">₹</span>
                        <p className="font-black text-xl text-[#1e1b4b] tabular-nums tracking-tighter">{req.amount}</p>
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 opacity-60">Ledger: ₹{req.real_amount}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#f8f5f0] rounded-lg flex items-center justify-center border border-black/5">
                            <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                          {editingWithdrawal?.id === req.id ? (
                            <input 
                              type="text"
                              className="bg-[#f8f5f0] border border-black/5 rounded-lg px-2 py-1 text-[10px] w-40 font-bold outline-none focus:ring-2 focus:ring-purple-200"
                              value={editingWithdrawal.upi_id}
                              onChange={e => setEditingWithdrawal({...editingWithdrawal, upi_id: e.target.value})}
                            />
                          ) : <span className="text-[11px] font-black text-slate-600 tracking-tight">{req.upi_id}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#f8f5f0] rounded-lg flex items-center justify-center border border-black/5">
                            <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                          {editingWithdrawal?.id === req.id ? (
                            <input 
                              type="text"
                              className="bg-[#f8f5f0] border border-black/5 rounded-lg px-2 py-1 text-[10px] w-40 font-bold outline-none focus:ring-2 focus:ring-purple-200"
                              value={editingWithdrawal.phone}
                              onChange={e => setEditingWithdrawal({...editingWithdrawal, phone: e.target.value})}
                            />
                          ) : <span className="text-[11px] font-black text-slate-600 tracking-tight">{req.phone}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                        req.status === 'paid' 
                          ? 'border-emerald-100 text-emerald-600 bg-emerald-50' 
                          : 'border-amber-100 text-amber-600 bg-amber-50'
                      }`}>
                        {req.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {editingWithdrawal?.id === req.id ? (
                          <>
                            <button 
                              onClick={() => handleUpdateWithdrawal(req.id, req.status)}
                              className="p-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all border border-emerald-100 shadow-sm shadow-emerald-500/10 active:scale-90"
                              title="Commit Changes"
                            >
                              <Save className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => setEditingWithdrawal(null)}
                              className="p-3 bg-red-50 text-red-500 rounded-xl transition-all border border-red-100 shadow-sm active:scale-90"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => setEditingWithdrawal(req)}
                              className="p-3 bg-white border border-black/5 text-slate-400 hover:text-[#7c3aed] hover:border-[#7c3aed]/20 rounded-xl transition-all shadow-sm active:scale-90"
                              title="Modify Gateway"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            {req.status !== 'paid' && (
                              <button 
                                onClick={() => handleUpdateWithdrawal(req.id, 'paid')}
                                className="p-3 bg-gradient-to-tr from-[#7c3aed] to-[#6366f1] text-white hover:brightness-110 rounded-xl transition-all shadow-xl shadow-purple-500/20 active:scale-90"
                                title="Finalize Payout"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {withdrawals.length === 0 && !isWithdrawLoading && (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="w-16 h-16 bg-[#f8f5f0] rounded-full flex items-center justify-center mx-auto mb-4 border border-black/5 shadow-inner">
                        <Clock className="w-8 h-8 text-slate-200" />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic opacity-60">Payout Pipeline Empty</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
