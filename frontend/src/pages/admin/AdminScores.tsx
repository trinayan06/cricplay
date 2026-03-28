import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { AdminLayout } from './AdminDashboard';
import { Plus, Minus, Trophy, Save, Zap, RefreshCw, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BASE_URL } from '@/src/lib/api';

// Scoring Weights
const POINTS = {
  fours: 3,
  sixes: 4,
  wickets: 4,
  catches: 3,
  hattrick: 8,
  no_ball: 3
};

interface PlayerScore {
  id: number;
  name: string;
  team: string;
  fours: number;
  sixes: number;
  wickets: number;
  catches: number;
  hattrick: number;
  no_ball: number;
  points: number;
}

const Counter = ({ value, onChange, label, color = "purple" }: { value: number, onChange: (val: number) => void, label: string, color?: string }) => (
  <div className="flex flex-col items-center gap-2 group">
    {label && <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">{label}</span>}
    <div className="flex items-center bg-[#f8f5f0] border border-black/5 rounded-2xl overflow-hidden shadow-inner p-1 group-hover:border-purple-200 transition-colors">
      <button 
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-9 h-9 flex items-center justify-center bg-white text-red-400 hover:bg-red-500 hover:text-white transition-all rounded-xl active:scale-90 shadow-sm border border-black/[0.03]"
      >
        <Minus className="w-4 h-4" />
      </button>
      <div className="w-12 text-center font-black text-[#1e1b4b] text-lg tabular-nums italic">
        {value}
      </div>
      <button 
        onClick={() => onChange(value + 1)}
        className="w-9 h-9 flex items-center justify-center bg-white text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all rounded-xl active:scale-90 shadow-sm border border-black/[0.03]"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export default function AdminScores() {
  const { matchId } = useParams();
  const [scores, setScores] = useState<PlayerScore[]>([]);
  const [match, setMatch] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const token = useAuthStore(state => state.token);

  const fetchData = useCallback(() => {
    fetch(`${BASE_URL}/api/matches/${matchId}`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setMatch(data?.match || null))
      .catch(err => console.error('Match Fetch Error:', err));

    fetch(`${BASE_URL}/api/admin/scores/${matchId}`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setScores(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error('Scores Fetch Error:', err);
        setScores([]);
      });
  }, [matchId, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const calculateTotal = (p: PlayerScore) => {
    return (p.fours * POINTS.fours) + 
           (p.sixes * POINTS.sixes) + 
           (p.wickets * POINTS.wickets) + 
           (p.catches * POINTS.catches) + 
           (p.hattrick * POINTS.hattrick) + 
           (p.no_ball * POINTS.no_ball);
  };

  const updateLocalScore = (playerId: number, field: keyof PlayerScore, value: number) => {
    setScores(prev => prev.map(p => {
      if (p.id === playerId) {
        const updated = { ...p, [field]: value };
        updated.points = calculateTotal(updated);
        saveScore(updated); // Trigger debounced save
        return updated;
      }
      return p;
    }));
  };

  // Simple debounce for saving
  const saveScore = useCallback((player: PlayerScore) => {
    setSaveStatus('Syncing...');
    const timeout = setTimeout(async () => {
      try {
        await fetch(`${BASE_URL}/api/admin/scores`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            match_id: matchId,
            player_id: player.id,
            fours: player.fours,
            sixes: player.sixes,
            wickets: player.wickets,
            catches: player.catches,
            hattrick: player.hattrick,
            no_ball: player.no_ball
          })
        });
        setSaveStatus('Live Synchronized');
        setTimeout(() => setSaveStatus(''), 2000);
      } catch (err) {
        setSaveStatus('Sync Failed!');
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [matchId, token]);

  if (!match) return <AdminLayout title="Scoreboard Controller"> <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center text-[#1e1b4b] font-black italic">CONNECTING TO FIELD DATA...</div> </AdminLayout>;

  const topPlayerId = scores.length > 0 ? [...scores].sort((a,b) => b.points - a.points)[0].id : null;

  return (
    <AdminLayout title={`Live Feed: ${match.team1} v ${match.team2}`}>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="bg-white border border-black/5 px-5 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
            <div className="w-2 h-2 bg-[#7c3aed] rounded-full animate-pulse shadow-[0_0_10px_rgba(124,58,237,0.5)]" />
            <span className="text-[10px] font-black text-[#1e1b4b] uppercase tracking-widest italic opacity-70">Calculation Engine Online</span>
          </div>
          <AnimatePresence mode="wait">
            {saveStatus && (
              <motion.div 
                key={saveStatus}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2 italic"
              >
                <RefreshCw className="w-3 h-3 animate-spin" /> {saveStatus}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button onClick={fetchData} className="text-[9px] font-black text-[#7c3aed] uppercase tracking-widest hover:brightness-90 transition-all border-b-2 border-purple-100 pb-0.5">Force Pipeline Refresh</button>
      </div>

      <div className="bg-white border border-black/5 rounded-[3rem] overflow-hidden shadow-[0_30px_70px_-20px_rgba(0,0,0,0.04)] mb-20 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#7c3aed]/5 rounded-full blur-[80px] -mr-32 -mt-32" />
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f8f5f0]/30 border-b border-black/[0.03]">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Contestant</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">4s</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">6s</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Wickets</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Catches</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Hat-trick</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">No-Ball</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#7c3aed] uppercase tracking-widest italic text-right pr-12">Total Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03]">
              {scores.map(p => (
                <tr key={p.id} className={`group hover:bg-[#f8f5f0]/20 transition-colors ${topPlayerId === p.id ? 'bg-amber-50/30' : ''}`}>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3">
                         <span className={`font-black uppercase italic tracking-tight text-lg leading-none ${topPlayerId === p.id ? 'text-amber-600' : 'text-[#1e1b4b]'}`}>
                           {p.name}
                         </span>
                         {topPlayerId === p.id && (
                           <div className="w-6 h-6 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-200 animate-bounce">
                             <Trophy className="w-3.5 h-3.5 text-amber-500" />
                           </div>
                         )}
                      </div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 opacity-60">{p.team} Registry</span>
                    </div>
                  </td>
                  <td className="px-4 py-6">
                    <Counter value={p.fours} label="" onChange={val => updateLocalScore(p.id, 'fours', val)} color="purple" />
                  </td>
                  <td className="px-4 py-6">
                    <Counter value={p.sixes} label="" onChange={val => updateLocalScore(p.id, 'sixes', val)} color="indigo" />
                  </td>
                  <td className="px-4 py-6">
                    <Counter value={p.wickets} label="" onChange={val => updateLocalScore(p.id, 'wickets', val)} color="rose" />
                  </td>
                  <td className="px-4 py-6 text-center">
                    <Counter value={p.catches} label="" onChange={val => updateLocalScore(p.id, 'catches', val)} />
                  </td>
                  <td className="px-4 py-6 text-center">
                    <Counter value={p.hattrick} label="" onChange={val => updateLocalScore(p.id, 'hattrick', val)} color="purple" />
                  </td>
                  <td className="px-4 py-6 text-center">
                    <Counter value={p.no_ball} label="" onChange={val => updateLocalScore(p.id, 'no_ball', val)} color="amber" />
                  </td>

                  <td className="px-8 py-6 text-right pr-12">
                    <div className="flex flex-col items-end">
                      <motion.div 
                        key={p.points}
                        initial={{ scale: 1.3, color: '#7c3aed' }}
                        animate={{ scale: 1, color: topPlayerId === p.id ? '#d97706' : '#6366f1' }}
                        className="font-black text-3xl tabular-nums italic tracking-tighter"
                      >
                        {p.points}
                      </motion.div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-40 mt-1">Net Points</span>
                    </div>
                  </td>
                </tr>
              ))}
              {scores.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-8 py-32 text-center">
                    <div className="w-20 h-20 bg-[#f8f5f0] rounded-full flex items-center justify-center mx-auto mb-6 border border-black/5 shadow-inner">
                      <Zap className="w-10 h-10 text-slate-200" />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] italic opacity-60">Field Data Terminal Idle</p>
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
