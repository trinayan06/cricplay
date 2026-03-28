import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { AdminLayout } from './AdminDashboard';
import { Plus, Edit, Trash2, Users, Activity, Trophy, Calendar, MapPin, Clock, ChevronRight, X } from 'lucide-react';
import { BASE_URL } from '@/src/lib/api';

export default function AdminMatches() {
  const [matches, setMatches] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ team1: '', team2: '', date: '', time: '', stadium: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const token = useAuthStore(state => state.token);

  const fetchMatches = () => {
    fetch(`${BASE_URL}/api/matches`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setMatches(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error('Matches Fetch Error:', err);
        setMatches([]);
      });
  };

  useEffect(() => {
    fetchMatches();
  }, [token]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await fetch(`${BASE_URL}/api/admin/matches/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...formData, status: matches.find(m => m.id === editingId)?.status || 'upcoming' })
      });
    } else {
      await fetch(`${BASE_URL}/api/admin/matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
    }
    setShowAdd(false);
    setEditingId(null);
    setFormData({ team1: '', team2: '', date: '', time: '', stadium: '' });
    fetchMatches();
  };

  const handleEdit = (match: any) => {
    setFormData({
      team1: match.team1,
      team2: match.team2,
      date: match.date,
      time: match.time,
      stadium: match.stadium
    });
    setEditingId(match.id);
    setShowAdd(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure?')) {
      await fetch(`${BASE_URL}/api/admin/matches/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchMatches();
    }
  };

  const handleStatusChange = async (id: number, status: string, match: any) => {
    await fetch(`${BASE_URL}/api/admin/matches/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ ...match, status })
    });
    fetchMatches();
  };

  return (
    <AdminLayout title="Fixture Control">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-[#1e1b4b] uppercase italic tracking-tight">Active Schedule</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage match availability and live status</p>
        </div>
        <button 
          onClick={() => {
            setShowAdd(!showAdd);
            if (showAdd) {
              setEditingId(null);
              setFormData({ team1: '', team2: '', date: '', time: '', stadium: '' });
            }
          }} 
          className={`px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg active:scale-95 ${showAdd ? 'bg-white border border-black/5 text-slate-400' : 'bg-gradient-to-r from-[#7c3aed] to-[#6366f1] text-white shadow-purple-500/25'}`}
        >
          {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {editingId ? 'Discard Edit' : (showAdd ? 'Close Panel' : 'Schedule New Match')}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white border border-black/5 p-8 rounded-[2.5rem] mb-10 shadow-xl shadow-black/[0.02] relative overflow-hidden animate-in slide-in-from-top duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#7c3aed]/5 rounded-full blur-[40px] -mr-16 -mt-16" />
          <form onSubmit={handleAdd} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="space-y-2 lg:col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Team 1 ID</label>
                <input type="text" placeholder="e.g. MI" required className="w-full bg-[#f8f5f0]/50 border border-black/5 rounded-2xl px-5 py-3.5 text-[#1e1b4b] font-bold focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 focus:bg-white transition-all shadow-inner" value={formData.team1} onChange={e => setFormData({...formData, team1: e.target.value})} />
              </div>
              <div className="space-y-2 lg:col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Team 2 ID</label>
                <input type="text" placeholder="e.g. CSK" required className="w-full bg-[#f8f5f0]/50 border border-black/5 rounded-2xl px-5 py-3.5 text-[#1e1b4b] font-bold focus:outline-none focus:ring-4 focus:ring-[#6366f1]/10 focus:bg-white transition-all shadow-inner" value={formData.team2} onChange={e => setFormData({...formData, team2: e.target.value})} />
              </div>
              <div className="space-y-2 lg:col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                <input type="date" required className="w-full bg-[#f8f5f0]/50 border border-black/5 rounded-2xl px-5 py-3.5 text-[#1e1b4b] font-bold focus:outline-none focus:ring-4 focus:ring-purple-100/50 focus:bg-white transition-all shadow-inner" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div className="space-y-2 lg:col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Time</label>
                <input type="time" required className="w-full bg-[#f8f5f0]/50 border border-black/5 rounded-2xl px-5 py-3.5 text-[#1e1b4b] font-bold focus:outline-none focus:ring-4 focus:ring-purple-100/50 focus:bg-white transition-all shadow-inner" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
              </div>
              <div className="space-y-2 lg:col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Venue Name</label>
                <input type="text" placeholder="Stadium" required className="w-full bg-[#f8f5f0]/50 border border-black/5 rounded-2xl px-5 py-3.5 text-[#1e1b4b] font-bold focus:outline-none focus:ring-4 focus:ring-purple-100/50 focus:bg-white transition-all shadow-inner" value={formData.stadium} onChange={e => setFormData({...formData, stadium: e.target.value})} />
              </div>
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-green-500 hover:brightness-110 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95 uppercase tracking-widest text-[11px]">
              {editingId ? 'Apply Configuration Changes' : 'Initialize New Entry'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-20">
        {matches.map(match => (
          <div key={match.id} className="bg-white border border-black/5 rounded-[2.5rem] p-8 shadow-sm group hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06)] hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-[#f8f5f0] group-hover:bg-gradient-to-r group-hover:from-[#7c3aed] group-hover:to-[#6366f1] transition-all" />
            
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="font-black text-2xl text-[#1e1b4b] italic uppercase tracking-tighter">{match.team1}</div>
                <div className="w-8 h-[1px] bg-slate-200" />
                <div className="font-black text-2xl text-[#1e1b4b] italic uppercase tracking-tighter">{match.team2}</div>
              </div>
              <select 
                value={match.status}
                onChange={(e) => handleStatusChange(match.id, e.target.value, match)}
                className={`text-[9px] font-black uppercase tracking-widest rounded-full px-3 py-1.5 border transition-all cursor-pointer shadow-sm outline-none ${
                    match.status === 'live' ? 'bg-red-50 text-red-500 border-red-100 animate-pulse' : 
                    match.status === 'completed' ? 'bg-green-50 text-green-600 border-green-100' : 
                    'bg-[#f8f5f0] text-slate-400 border-black/5'
                }`}
              >
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div className="space-y-2 mb-8 bg-[#f8f5f0]/50 p-4 rounded-2xl border border-black/[0.02]">
              <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                <Calendar className="w-4 h-4 text-[#7c3aed]" /> {match.date} <span className="text-slate-200">|</span> <Clock className="w-4 h-4 text-[#6366f1]" /> {match.time}
              </div>
              <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                <MapPin className="w-4 h-4 text-[#7c3aed]" /> {match.stadium}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <Link to={`/dnt/players/${match.id}`} className="bg-[#f8f5f0] hover:bg-[#7c3aed] hover:text-white text-slate-400 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl flex flex-col justify-center items-center gap-1.5 transition-all border border-black/5 shadow-inner group/btn">
                <Users className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> Players
              </Link>
              <Link to={`/dnt/scores/${match.id}`} className="bg-blue-50/50 hover:bg-blue-600 hover:text-white text-blue-500 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl flex flex-col justify-center items-center gap-1.5 transition-all border border-blue-100 shadow-sm group/btn">
                <Activity className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> Scores
              </Link>
              <Link to={`/dnt/leaderboard/${match.id}`} className="bg-amber-50/50 hover:bg-amber-500 hover:text-white text-amber-600 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl flex flex-col justify-center items-center gap-1.5 transition-all border border-amber-100 shadow-sm group/btn">
                <Trophy className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> Rank
              </Link>
            </div>
            
            <div className="mt-4 flex gap-2.5">
              <button onClick={() => handleEdit(match)} className="flex-1 bg-white border border-black/5 text-slate-400 hover:text-[#1e1b4b] hover:bg-[#f8f5f0] py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-sm">
                <Edit className="w-4 h-4" /> Edit
              </button>
              <button onClick={() => handleDelete(match.id)} className="w-12 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all flex items-center justify-center border border-red-100 shadow-sm">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
