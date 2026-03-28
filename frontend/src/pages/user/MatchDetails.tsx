import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ChevronLeft, Check, Trophy, Loader2 } from 'lucide-react';
import { BASE_URL } from '@/src/lib/api';

export default function MatchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [captain, setCaptain] = useState<number | null>(null);
  const [viceCaptain, setViceCaptain] = useState<number | null>(null);
  const [existingTeam, setExistingTeam] = useState<any>(null);
  const [step, setStep] = useState(1); // 1: Select Players, 2: Select C/VC
  const [logos, setLogos] = useState<Record<string, string>>({});
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    Promise.all([
      fetch(`${BASE_URL}/api/matches/${id}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
      fetch(`${BASE_URL}/api/teams/${id}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
      fetch(`${BASE_URL}/api/teams`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json())
    ]).then(([matchData, teamData, logosData]) => {
      if (matchData) {
        setMatch(matchData.match || null);
        setPlayers(matchData.players || []);
      }
      setLogos(logosData || {});
      
      if (teamData) {
        setExistingTeam(teamData);
        setSelectedPlayers(teamData.player_ids || []);
        setCaptain(teamData.captain_id || null);
        setViceCaptain(teamData.vice_captain_id || null);
      }
    }).catch(err => {
      console.error('Match Details Fetch Error:', err);
    });
  }, [id, token]);

  const togglePlayer = (playerId: number) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
      if (captain === playerId) setCaptain(null);
      if (viceCaptain === playerId) setViceCaptain(null);
    } else {
      if (selectedPlayers.length < 11) {
        setSelectedPlayers([...selectedPlayers, playerId]);
      } else {
        alert('You can only select 11 players');
      }
    }
  };

  const handleSaveTeam = async () => {
    if (selectedPlayers.length !== 11) return alert('Select exactly 11 players');
    if (!captain || !viceCaptain) return alert('Select Captain and Vice Captain');
    if (captain === viceCaptain) return alert('Captain and Vice Captain must be different');

    const res = await fetch(`${BASE_URL}/api/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ match_id: id, player_ids: selectedPlayers, captain_id: captain, vice_captain_id: viceCaptain })
    });

    if (res.ok) {
      navigate(`/contest/${id}`);
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to save team');
    }
  };

  if (!match) return <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center text-[#1e1b4b] font-black italic uppercase tracking-widest">Warming Up Squad...</div>;

  const team1Count = selectedPlayers.filter(pid => players.find(p => p.id === pid)?.team === match.team1).length;
  const team2Count = selectedPlayers.filter(pid => players.find(p => p.id === pid)?.team === match.team2).length;
  const totalCredits = selectedPlayers.reduce((sum, pid) => sum + (players.find(p => p.id === pid)?.credits || 0), 0);

  const matchDateObj = new Date(`${match.date}T19:30:00+05:30`);
  const isDeadlinePassed = new Date() > matchDateObj;

  return (
    <div className="min-h-screen bg-[#f8f5f0] pb-32 font-sans overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-black/5 sticky top-0 z-30">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="w-9 h-9 flex items-center justify-center bg-[#f8f5f0] rounded-full text-slate-400 hover:text-purple-600 transition-all border border-black/5">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-sm font-black text-[#1e1b4b] uppercase tracking-tighter italic">
                {match.team1} <span className="text-[#6366f1] not-italic text-[10px] mx-1">vs</span> {match.team2}
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{match.time}</p>
            </div>
          </div>
          {existingTeam && (
            <Link to={`/leaderboard/${id}`} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:bg-blue-100 transition-all border border-blue-100 shadow-sm">
              <Trophy className="w-3.5 h-3.5" /> Rewards
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto">
        {/* Team Stats Bar */}
        <div className="bg-white/80 backdrop-blur-lg p-5 sticky top-16 z-20 border-b border-black/5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center mb-4">
            <div className="text-center group">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{match.team1}</p>
              <p className="text-lg font-black text-[#1e1b4b] tabular-nums scale-110 group-hover:text-blue-500 transition-colors">{team1Count}</p>
            </div>
            <div className="h-8 w-[1px] bg-black/5" />
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Squad</p>
              <div className="flex items-baseline gap-0.5">
                <p className="text-lg font-black text-[#7c3aed] tabular-nums">{selectedPlayers.length}</p>
                <p className="text-[10px] font-bold text-slate-400">/11</p>
              </div>
            </div>
            <div className="h-8 w-[1px] bg-black/5" />
            <div className="text-center group">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{match.team2}</p>
              <p className="text-lg font-black text-[#1e1b4b] tabular-nums scale-110 group-hover:text-amber-500 transition-colors">{team2Count}</p>
            </div>
            <div className="h-8 w-[1px] bg-black/5" />
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Credits</p>
              <p className={`text-lg font-black tabular-nums transition-colors ${100 - totalCredits < 0 ? 'text-red-500' : 'text-[#6366f1]'}`}>
                {100 - totalCredits}
              </p>
            </div>
          </div>
          <div className="w-full bg-[#f8f5f0] h-2.5 rounded-full overflow-hidden flex shadow-inner border border-black/[0.03]">
            <div className="bg-blue-500 h-full transition-all duration-500 rounded-r-lg shadow-lg shadow-blue-500/30" style={{ width: `${(team1Count / 11) * 100}%` }}></div>
            <div className="bg-amber-500 h-full transition-all duration-500 rounded-l-lg shadow-lg shadow-amber-500/30 ml-auto" style={{ width: `${(team2Count / 11) * 100}%` }}></div>
          </div>
        </div>

        {step === 1 ? (
          <div className="divide-y divide-black/[0.03] bg-white border-b border-black/5">
            {players.map(player => {
              const isSelected = selectedPlayers.includes(player.id);
              return (
                <div 
                  key={player.id} 
                  onClick={() => togglePlayer(player.id)}
                  className={`p-5 flex items-center justify-between cursor-pointer transition-all duration-300 ${isSelected ? 'bg-[#7c3aed]/5 border-l-4 border-[#7c3aed]' : 'hover:bg-[#f8f5f0]'}`}
                >
                  <div className="flex items-center gap-5">
                    <div className="relative group/avatar">
                      <div className="w-14 h-14 bg-[#f8f5f0] rounded-2xl flex items-center justify-center text-slate-400 border border-black/5 overflow-hidden shadow-sm group-hover/avatar:scale-105 transition-transform">
                        {logos[player.team] ? (
                          <img src={logos[player.team]} alt={player.team} className="w-full h-full object-contain p-2" />
                        ) : (
                          <span className="text-xs font-black italic text-slate-300">{player.name.substring(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      {isSelected && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#7c3aed] rounded-lg rotate-12 flex items-center justify-center border-2 border-white shadow-lg z-10">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-[#1e1b4b] uppercase tracking-tight italic group-hover:text-[#7c3aed] transition-colors">{player.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${player.team === match.team1 ? 'bg-blue-50 text-blue-500 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                          {player.team}
                        </span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{player.role}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-black text-[#1e1b4b] text-base tabular-nums">{player.credits}</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Credits</span>
                  </div>
                </div>
              );
            })}
            {players.length === 0 && (
              <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs italic">
                Searching for players...
              </div>
            )}
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="bg-[#ede9fe] border border-[#7c3aed]/10 p-5 rounded-[2rem] shadow-sm">
              <p className="text-[10px] text-[#7c3aed] font-black uppercase tracking-[0.15em] text-center leading-relaxed">
                <span className="bg-white px-2 py-0.5 rounded-full mr-1 shadow-sm italic">Captain</span> gets <span className="text-[#1e1b4b]">2x</span> points <br/>
                <span className="bg-white px-2 py-0.5 rounded-full mr-1 ml-1 shadow-sm italic">Vice Captain</span> gets <span className="text-[#1e1b4b]">1.5x</span> points
              </p>
            </div>
            
            {players.filter(p => selectedPlayers.includes(p.id)).map(player => (
              <div key={player.id} className="bg-white border border-black/5 p-5 rounded-[2.5rem] flex items-center justify-between shadow-sm group hover:scale-[1.02] transition-transform duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#f8f5f0] rounded-2xl flex items-center justify-center shadow-inner border border-black/5 overflow-hidden">
                    {logos[player.team] ? <img src={logos[player.team]} className="w-full h-full object-contain p-2 text-[#7c3aed]" /> : <span className="text-[10px] font-black italic">{player.name.substring(0,2)}</span>}
                  </div>
                  <div>
                    <h3 className="font-black text-[#1e1b4b] uppercase tracking-tight italic">{player.name}</h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{player.role} • {player.team}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setCaptain(player.id)}
                    className={`w-11 h-11 rounded-2xl font-black text-xs flex items-center justify-center transition-all shadow-md active:scale-95 ${captain === player.id ? 'bg-[#7c3aed] text-white scale-110 shadow-purple-500/30' : 'bg-[#f8f5f0] text-slate-400 hover:bg-[#ede9fe] hover:text-[#7c3aed]'}`}
                  >
                    C
                  </button>
                  <button 
                    onClick={() => setViceCaptain(player.id)}
                    className={`w-11 h-11 rounded-2xl font-black text-xs flex items-center justify-center transition-all shadow-md active:scale-95 ${viceCaptain === player.id ? 'bg-[#6366f1] text-white scale-110 shadow-indigo-500/30' : 'bg-[#f8f5f0] text-slate-400 hover:bg-[#ede9fe] hover:text-[#6366f1]'}`}
                  >
                    VC
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-black/5 p-5 z-40 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto flex flex-col gap-3">
          {isDeadlinePassed && (
            <div className="text-center text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-50 py-2.5 rounded-full border border-red-100 italic">
              Entry Locked • Deadline Passed
            </div>
          )}
          <div className="flex gap-4">
            {step === 1 ? (
              <button 
                onClick={() => setStep(2)}
                disabled={selectedPlayers.length !== 11 || isDeadlinePassed}
                className="flex-1 bg-gradient-to-r from-[#7c3aed] to-[#6366f1] hover:brightness-110 disabled:grayscale disabled:opacity-50 text-white font-black py-4 rounded-[1.5rem] transition-all shadow-xl shadow-purple-500/25 active:scale-95 uppercase tracking-[0.2em] text-[10px]"
              >
                PROCEED TO C/VC
              </button>
            ) : (
              <>
                <button 
                  onClick={() => setStep(1)}
                  className="w-1/3 bg-[#f8f5f0] hover:bg-white text-slate-400 font-black py-4 rounded-[1.5rem] transition-all border border-black/5 uppercase tracking-[0.2em] text-[10px] shadow-inner"
                >
                  BACK
                </button>
                <button 
                  onClick={handleSaveTeam}
                  disabled={!captain || !viceCaptain || captain === viceCaptain || isDeadlinePassed}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-500 hover:brightness-110 disabled:grayscale disabled:opacity-50 text-white font-black py-4 rounded-[1.5rem] transition-all shadow-xl shadow-emerald-500/25 active:scale-95 uppercase tracking-[0.2em] text-[10px]"
                >
                  SAVE MY TEAM
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
