import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { AdminLayout } from './AdminDashboard';
import { Edit, Trash2, X, Check, Loader2, UserPlus, ShieldCheck, CreditCard, ChevronRight, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BASE_URL } from '@/src/lib/api';

export default function AdminPlayers() {
  const { matchId } = useParams();
  const [players, setPlayers] = useState<any[]>([]);
  const [match, setMatch] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', team: '', role: 'BAT', credits: 8.5 });
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const token = useAuthStore(state => state.token);

  const fetchData = () => {
    Promise.all([
      fetch(`${BASE_URL}/api/matches/${matchId}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
      fetch(`${BASE_URL}/api/teams`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json())
    ]).then(([matchData, logosData]) => {
      setMatch(matchData?.match || null);
      setPlayers(matchData?.players || []);
      if (matchData?.match && !formData.team) {
        setFormData(prev => ({ ...prev, team: matchData.match.team1 }));
      }
    }).catch(err => {
      console.error('Data Fetch Error:', err);
    });
  };

  useEffect(() => {
    fetchData();
  }, [matchId, token]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Sync with Supabase Database first
    await fetch(`${BASE_URL}/api/players`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        team: formData.team,
        role: formData.role,
        credits: formData.credits
      })
    });

    await fetch(`${BASE_URL}/api/admin/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ ...formData, match_id: matchId })
    });
    setFormData({ ...formData, name: '', credits: 8.5 });
    fetchData();
    setIsLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      await fetch(`${BASE_URL}/api/admin/players/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPlayers(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await fetch(`${BASE_URL}/api/admin/players/${editingPlayer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(editingPlayer)
    });
    setPlayers(prev => prev.map(p => p.id === editingPlayer.id ? editingPlayer : p));
    setEditingPlayer(null);
    setIsLoading(false);
  };

  if (!match) return <AdminLayout title="Player Registry"> <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center text-[#1e1b4b] font-black italic">FETCHING SQUAD DATA...</div> </AdminLayout>;

  return (
    <AdminLayout title={`Squad: ${match.team1} v ${match.team2}`}>
      {/* Add Player Console */}
      <div className="bg-white border border-black/5 p-10 rounded-[3rem] mb-10 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#7c3aed]/5 rounded-full blur-[80px] -mr-32 -mt-32" />
        <h3 className="text-xl font-black text-[#1e1b4b] mb-8 uppercase tracking-tight italic flex items-center gap-3">
           <div className="w-10 h-10 bg-[#ede9fe] rounded-xl flex items-center justify-center shadow-sm">
             <UserPlus className="w-6 h-6 text-[#7c3aed]" />
           </div>
           Draft New Player
        </h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity (Name)</label>
            <input type="text" placeholder="Player Name" required className="w-full bg-[#f8f5f0]/50 border border-black/5 rounded-2xl px-5 py-4 text-[#1e1b4b] font-bold focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 focus:bg-white transition-all shadow-inner" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Affiliation (Team)</label>
            <select className="w-full bg-[#f8f5f0]/50 border border-black/5 rounded-2xl px-5 py-4 text-[#1e1b4b] font-bold focus:outline-none focus:ring-4 focus:ring-[#6366f1]/10 focus:bg-white transition-all shadow-inner cursor-pointer" value={formData.team} onChange={e => setFormData({...formData, team: e.target.value})}>
              <option value={match.team1}>{match.team1}</option>
              <option value={match.team2}>{match.team2}</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Field Role</label>
            <select className="w-full bg-[#f8f5f0]/50 border border-black/5 rounded-2xl px-5 py-4 text-[#1e1b4b] font-bold focus:outline-none focus:ring-4 focus:ring-purple-100/50 focus:bg-white transition-all shadow-inner cursor-pointer" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="BAT">Batsman</option>
              <option value="BOWL">Bowler</option>
              <option value="AR">All-Rounder</option>
              <option value="WK">Wicket Keeper</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Salary (Credits)</label>
            <input type="number" step="0.5" placeholder="8.5" required className="w-full bg-[#f8f5f0]/50 border border-black/5 rounded-2xl px-5 py-4 text-[#1e1b4b] font-bold focus:outline-none focus:ring-4 focus:ring-purple-100/50 focus:bg-white transition-all shadow-inner" value={formData.credits} onChange={e => setFormData({...formData, credits: parseFloat(e.target.value)})} />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-[#7c3aed] to-[#6366f1] hover:brightness-110 disabled:grayscale disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-purple-500/25 active:scale-95 uppercase tracking-widest text-[11px] flex items-center justify-center gap-3">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Confirm Entry</>}
            </button>
          </div>
        </form>
      </div>

      {/* Roster Table */}
      <div className="bg-white border border-black/5 rounded-[3rem] overflow-hidden shadow-[0_30px_70px_-20px_rgba(0,0,0,0.04)] mb-20">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#f8f5f0]/30 border-b border-black/[0.03]">
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Identity</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Affiliation</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Field Role</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Valuation</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right pr-12">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.03]">
            {players.map(p => (
              <tr key={p.id} className="hover:bg-[#f8f5f0]/20 transition-colors group">
                <td className="px-8 py-6">
                  <p className="text-[#1e1b4b] font-black uppercase italic tracking-tight text-lg">{p.name}</p>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${p.team === match.team1 ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                    {p.team}
                  </span>
                </td>
                <td className="px-8 py-6 text-center">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#f8f5f0] rounded-lg border border-black/[0.03]">
                     <span className="text-[10px] font-black text-[#6366f1]">{p.role === 'AR' ? 'ALL-ROUNDER' : p.role}</span>
                   </div>
                </td>
                <td className="px-8 py-6 text-center">
                   <div className="flex items-center justify-center gap-1">
                      <span className="text-xs font-black text-[#7c3aed] italic">₵</span>
                      <p className="font-black text-xl text-[#1e1b4b] tabular-nums tracking-tighter">{p.credits}</p>
                   </div>
                </td>
                <td className="px-8 py-6 text-right pr-12">
                  <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingPlayer(p)} className="p-3 bg-white border border-black/5 text-slate-400 hover:text-[#7c3aed] hover:border-[#7c3aed]/20 rounded-xl transition-all shadow-sm active:scale-90">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-3 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-100 shadow-sm active:scale-90">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {players.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-24 text-center">
                   <div className="w-20 h-20 bg-[#f8f5f0] rounded-full flex items-center justify-center mx-auto mb-6 border border-black/5 shadow-inner">
                      <Users className="w-10 h-10 text-slate-200" />
                   </div>
                   <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] italic opacity-60">No players discovered for this fixture</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Overlay */}
      <AnimatePresence>
        {editingPlayer && (
          <div className="fixed inset-0 bg-[#1e1b4b]/60 backdrop-blur-md flex items-center justify-center z-50 p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white border border-black/5 p-12 rounded-[3.5rem] w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#7c3aed] to-[#6366f1]" />
              
              <button onClick={() => setEditingPlayer(null)} className="absolute top-8 right-8 w-11 h-11 bg-[#f8f5f0] text-slate-400 hover:text-red-500 rounded-full flex items-center justify-center transition-all border border-black/5 shadow-inner">
                <X className="w-6 h-6" />
              </button>
              
              <h3 className="text-2xl font-black text-[#1e1b4b] mb-10 uppercase tracking-tight italic flex items-center gap-4">
                 <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center shadow-sm">
                   <ShieldCheck className="w-7 h-7 text-[#7c3aed]" />
                 </div>
                 Alter Player Profile
              </h3>
              
              <form onSubmit={handleEditSave} className="space-y-6">
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Identity (Name)</label>
                  <input 
                    type="text" 
                    value={editingPlayer.name} 
                    onChange={e => setEditingPlayer({...editingPlayer, name: e.target.value})} 
                    className="w-full bg-[#f8f5f0]/50 border border-black/5 rounded-2xl py-4 px-5 text-[#1e1b4b] font-black focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all shadow-inner" 
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Affiliation</label>
                    <select 
                      value={editingPlayer.team} 
                      onChange={e => setEditingPlayer({...editingPlayer, team: e.target.value})} 
                      className="w-full bg-[#f8f5f0]/50 border border-black/5 rounded-2xl py-4 px-5 text-[#1e1b4b] font-black focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all shadow-inner cursor-pointer"
                    >
                      <option value={match.team1}>{match.team1}</option>
                      <option value={match.team2}>{match.team2}</option>
                    </select>
                  </div>
                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Legacy Role</label>
                    <select 
                      value={editingPlayer.role} 
                      onChange={e => setEditingPlayer({...editingPlayer, role: e.target.value})} 
                      className="w-full bg-[#f8f5f0]/50 border border-black/5 rounded-2xl py-4 px-5 text-[#1e1b4b] font-black focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all shadow-inner cursor-pointer"
                    >
                      <option value="BAT">BAT</option>
                      <option value="BOWL">BOWL</option>
                      <option value="AR">AR</option>
                      <option value="WK">WK</option>
                    </select>
                  </div>
                </div>
                
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Market Valuation (Credits)</label>
                   <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-black/5">
                        <CreditCard className="w-4 h-4 text-[#6366f1]" />
                      </div>
                      <input 
                        type="number" 
                        step="0.5" 
                        value={editingPlayer.credits} 
                        onChange={e => setEditingPlayer({...editingPlayer, credits: parseFloat(e.target.value)})} 
                        className="w-full bg-[#f8f5f0]/50 border border-black/5 rounded-2xl py-4 pl-14 pr-5 text-[#1e1b4b] font-black focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all shadow-inner" 
                        required 
                      />
                   </div>
                </div>
                
                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => setEditingPlayer(null)} className="flex-1 px-6 py-4 rounded-2xl border border-black/5 text-slate-400 font-black uppercase tracking-widest text-[10px] transition-all hover:bg-[#f8f5f0]">
                    Cancel
                  </button>
                  <button type="submit" disabled={isLoading} className="flex-1 bg-gradient-to-r from-[#7c3aed] to-[#6366f1] hover:brightness-110 text-white font-black py-4 rounded-2xl shadow-xl shadow-purple-500/25 transition-all active:scale-95 uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Commit Update</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
