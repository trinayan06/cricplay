import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { AdminLayout } from './AdminDashboard';
import { Trophy, Edit2, Check, X, User, ArrowLeft } from 'lucide-react';
import { BASE_URL } from '@/src/lib/api';

export default function AdminLeaderboard() {
  const { id } = useParams();
  const [leaderboard, setLeaderboard] = useState<any[] | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPoints, setEditPoints] = useState<string>('');
  const token = useAuthStore(state => state.token);

  const fetchLeaderboard = () => {
    fetch(`${BASE_URL}/api/leaderboard/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        // Ensure we handle both potential array and object return formats safely
        const arrayData = Array.isArray(data) ? data : (data?.leaderboard || []);
        setLeaderboard(arrayData);
      })
      .catch(err => {
        console.error('Leaderboard Fetch Error:', err);
        setLeaderboard([]);
      });
  };

  useEffect(() => {
    if (id) fetchLeaderboard();
  }, [id, token]);

  const handleEditClick = (team: any) => {
    setEditingId(team.id);
    setEditPoints(team.points.toString());
  };

  const handleSavePoints = async (userId: number, teamId: number) => {
    try {
      const parsedPoints = parseFloat(editPoints);
      
      // We must calculate the new rank for Supabase Sync
      // Because we edit points locally in state and sync it back
      const rankIndex = leaderboard?.findIndex(entry => entry.user_id === userId);
      const rank = rankIndex !== undefined && rankIndex !== -1 ? rankIndex + 1 : 1;

      // Sync with Supabase Database first
      await fetch(`${BASE_URL}/api/leaderboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          points: parsedPoints,
          rank: rank
        })
      });

      // Sync with Internal Database
      await fetch(`${BASE_URL}/api/admin/leaderboard/${id}/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ points: parsedPoints })
      });
      setEditingId(null);
      fetchLeaderboard();
    } catch (error) {
      console.error('Failed to update points', error);
    }
  };

  if (!leaderboard) return <AdminLayout title="System Check"> <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center text-[#1e1b4b] font-black italic uppercase tracking-[0.2em] animate-pulse">Establishing Connection...</div> </AdminLayout>;

  return (
    <AdminLayout title="Ranking Authority">
      <div className="mb-8 flex justify-between items-end px-2">
        <div>
          <h3 className="text-xl font-black text-[#1e1b4b] uppercase italic tracking-tight">Post-Match Standings</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Finalize and verify contestant performance</p>
        </div>
        <Link to="/dnt/matches" className="flex items-center gap-2 text-[10px] font-black text-[#7c3aed] uppercase tracking-widest hover:brightness-90 transition-all border-b-2 border-purple-100 pb-0.5 group mb-1">
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Back to matches
        </Link>
      </div>

      <div className="bg-white border border-black/5 rounded-[3rem] overflow-hidden shadow-[0_30px_70px_-20px_rgba(0,0,0,0.04)] mb-20 relative transition-all">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] -mr-32 -mt-32" />
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f8f5f0]/30 border-b border-black/[0.03]">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Rank Pos</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Contestant</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right">Net Points</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right pr-12">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03]">
              {leaderboard?.map((entry, index) => (
                <tr key={entry.id} className="hover:bg-[#f8f5f0]/20 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      {index === 0 ? (
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-200 shadow-sm animate-pulse">
                          <Trophy className="w-5 h-5 text-amber-500" />
                        </div>
                      ) : index === 1 ? (
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200 shadow-sm">
                          <Trophy className="w-5 h-5 text-slate-400" />
                        </div>
                      ) : index === 2 ? (
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-200 shadow-sm">
                          <Trophy className="w-5 h-5 text-orange-600" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-[#f8f5f0] rounded-xl flex items-center justify-center border border-black/[0.03] shadow-inner">
                          <span className="text-[10px] font-black text-slate-300 italic">#{index + 1}</span>
                        </div>
                      )}
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-40">Entry Tier</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#f8f5f0] rounded-xl flex items-center justify-center border border-black/5 shadow-inner">
                        <User className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <div className="font-black text-[#1e1b4b] uppercase italic tracking-tight text-lg leading-none">{entry.name}</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5 opacity-60">Identity Ref: {entry.user_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {editingId === entry.id ? (
                      <input
                        type="number"
                        value={editPoints}
                        onChange={(e) => setEditPoints(e.target.value)}
                        className="w-32 bg-[#f8f5f0] border border-black/5 rounded-xl px-4 py-2 text-[#1e1b4b] font-black text-right focus:outline-none focus:ring-4 focus:ring-purple-100 shadow-inner"
                      />
                    ) : (
                      <div className="flex flex-col items-end">
                         <div className="flex items-center justify-end gap-1">
                          <span className="text-xs font-black text-[#6366f1] italic">Σ</span>
                          <span className="font-black text-2xl text-[#1e1b4b] tabular-nums tracking-tighter">{entry.points}</span>
                         </div>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest opacity-40 mt-1">Efficiency Rating</p>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right pr-12">
                    {editingId === entry.id ? (
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleSavePoints(entry.user_id, entry.id)}
                          className="p-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all border border-emerald-100 shadow-sm shadow-emerald-500/10 active:scale-90"
                          title="Commit Override"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-3 bg-red-50 text-red-500 rounded-xl transition-all border border-red-100 shadow-sm active:scale-90"
                          title="Discard"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditClick(entry)}
                        className="p-3 bg-white border border-black/5 text-slate-400 hover:text-[#7c3aed] hover:border-[#7c3aed]/20 rounded-xl transition-all shadow-sm active:scale-90 group-hover:px-6 flex items-center gap-2"
                        title="Manual Override"
                      >
                        <Edit2 className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest overflow-hidden max-w-0 group-hover:max-w-xs transition-all duration-500">Override Ranking</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {leaderboard?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-32 text-center">
                    <div className="w-16 h-16 bg-[#f8f5f0] rounded-full flex items-center justify-center mx-auto mb-6 border border-black/5 shadow-inner">
                      <Trophy className="w-8 h-8 text-slate-200" />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] italic opacity-60">Consensus Pipeline Pending Approval</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
