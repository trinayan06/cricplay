import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ChevronLeft, Trophy, Calendar, Medal } from 'lucide-react';
import BottomNav from '../../components/BottomNav';
import { BASE_URL } from '@/src/lib/api';

export default function LeaderboardList() {
  const [matches, setMatches] = useState<any[]>([]);
  const [logos, setLogos] = useState<Record<string, string>>({});
  const { token } = useAuthStore();

  useEffect(() => {
    Promise.all([
      fetch(`${BASE_URL}/api/matches`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
      fetch(`${BASE_URL}/api/teams`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json())
    ]).then(([matchesData, logosData]) => {
      const sorted = [...matchesData].sort((a, b) => {
        const order = { 'live': 0, 'completed': 1, 'upcoming': 2 };
        return (order[a.status as keyof typeof order] ?? 3) - (order[b.status as keyof typeof order] ?? 3);
      });
      setMatches(sorted);
      setLogos(logosData);
    });
  }, [token]);

  return (
    <div className="min-h-screen bg-[#f8f5f0] pb-36 font-sans">
      <header className="bg-white/80 backdrop-blur-xl border-b border-black/5 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center gap-3">
          <Link to="/" className="w-8 h-8 flex items-center justify-center bg-[#f8f5f0] rounded-full text-slate-400 hover:text-purple-600 transition-colors border border-black/5">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-black text-[#1e1b4b] tracking-tighter flex items-center gap-2">
             <Trophy className="w-5 h-5 text-amber-500" />
             Winners Circle
          </h1>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4 mt-2">
        <div className="bg-blue-50 border border-blue-100 p-5 rounded-3xl mb-6 shadow-inner">
          <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest text-center leading-relaxed">
            Select a match to view its full leaderboard <br/> and claim your winnings.
          </p>
        </div>

        {matches.map(match => (
          <Link 
            key={match.id} 
            to={`/leaderboard/${match.id}`}
            className="block bg-white border border-black/5 rounded-[2rem] overflow-hidden hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.08)] transition-all hover:scale-[1.02] shadow-sm group active:scale-95 duration-500"
          >
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 bg-white rounded-full border border-black/5 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform p-1">
                    {logos[match.team1] ? <img src={logos[match.team1]} className="w-full h-full object-contain" /> : <span className="text-[10px] font-black text-purple-600 italic">{match.team1.substring(0,2)}</span>}
                  </div>
                  <div className="w-10 h-10 bg-white rounded-full border border-black/5 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform p-1">
                    {logos[match.team2] ? <img src={logos[match.team2]} className="w-full h-full object-contain" /> : <span className="text-[10px] font-black text-purple-600 italic">{match.team2.substring(0,2)}</span>}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#1e1b4b] uppercase tracking-tight group-hover:text-[#7c3aed] transition-colors italic">
                    {match.team1} vs {match.team2}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                    <Calendar className="w-3 h-3 text-[#6366f1]" /> {match.date}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all ${
                    match.status === 'live' ? 'border-red-100 text-red-500 bg-red-50 animate-pulse' :
                    match.status === 'completed' ? 'border-green-100 text-green-600 bg-green-50' :
                    'border-slate-100 text-slate-400 bg-slate-50'
                  }`}>
                  {match.status}
                </span>
                <div className="w-10 h-10 bg-[#f8f5f0] rounded-full flex items-center justify-center border border-black/5 group-hover:bg-amber-50 transition-colors shadow-inner">
                  <Medal className="w-5 h-5 text-slate-300 group-hover:text-amber-500 transition-colors" />
                </div>
              </div>
            </div>
          </Link>
        ))}

        {matches.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-black/5 text-slate-400 font-bold uppercase tracking-widest text-xs italic shadow-sm">
            Searching for matches...
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

