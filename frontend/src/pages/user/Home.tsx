import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Trophy, Calendar, MapPin, Clock, LogOut, Loader2 } from 'lucide-react';
import BottomNav from '../../components/BottomNav';
import { BASE_URL } from '@/src/lib/api';

export default function Home() {
  const [matches, setMatches] = useState<any[]>([]);
  const [teams, setTeams] = useState<Record<string, string>>({});
  const [preMatchUrl, setPreMatchUrl] = useState<string | null>(null);
  const [highlightUrl, setHighlightUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pre' | 'highlights'>('pre');
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const { token, user, logout } = useAuthStore();

  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const cleanedUrl = url.trim().replace(/["']/g, '');
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = cleanedUrl.match(regExp);
    const id = (match && match[2]) ? match[2] : null;
    return (id && id.length >= 11) ? id.substring(0, 11) : id;
  };

  const currentVideoUrl = activeTab === 'pre' ? preMatchUrl : highlightUrl;
  const videoId = currentVideoUrl ? getYouTubeId(currentVideoUrl) : null;

  useEffect(() => {
    fetch(`${BASE_URL}/api/videos`)
      .then(res => res.json())
      .then(data => {
        if (data?.preMatchUrl) setPreMatchUrl(data.preMatchUrl);
        if (data?.highlightUrl) setHighlightUrl(data.highlightUrl);
        setIsVideoLoading(false);
      })
      .catch((err) => {
        console.error('Video Fetch Error:', err);
        setIsVideoLoading(false);
      });
  }, []);

  useEffect(() => {
    Promise.all([
      fetch(`${BASE_URL}/api/matches`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
      fetch(`${BASE_URL}/api/teams`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json())
    ]).then(([matchesData, teamsData]) => {
      setMatches(Array.isArray(matchesData) ? matchesData : []);
      setTeams(teamsData || {});
    }).catch(err => {
      console.error('Data Fetch Error:', err);
      setMatches([]);
    });
  }, [token]);

  return (
    <div className="min-h-screen bg-[#f8f5f0] pb-36 font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-black/5 sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform">
            <img 
              src="/logo.png" 
              alt="CricPlay Logo" 
              className="h-10 w-auto object-contain rounded-xl drop-shadow-sm"
            />
            <h1 className="text-xl font-black bg-gradient-to-r from-[#7c3aed] to-[#6366f1] bg-clip-text text-transparent hidden sm:block tracking-tighter">CRICPLAY</h1>
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={() => window.open("https://www.cricbuzz.com/cricket-match/live-scores", "_blank")} className="text-[10px] font-black uppercase tracking-tighter text-red-500 bg-red-50 border border-red-100 px-4 py-2 rounded-full transition-all flex items-center gap-2 shadow-sm hover:shadow-red-500/10 active:scale-95">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Live Score
            </button>
            <Link to="/profile" className="flex items-center gap-2 p-1 pr-4 bg-white border border-black/5 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95">
              <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center font-black text-xs border border-blue-100">
                {user?.name?.substring(0, 1).toUpperCase()}
              </div>
              <span className="text-sm font-bold text-[#1e1b4b] hidden xs:block">{user?.name?.split(' ')[0]}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-8 mt-2">
        
        {/* Match Video Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-black/5 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] p-3 relative hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500">
            {/* Tabs */}
            <div className="flex bg-[#f8f5f0] p-1.5 rounded-[1.25rem] mb-4 border border-black/5 max-w-sm mx-auto shadow-inner">
              <button 
                onClick={() => setActiveTab('pre')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'pre' ? 'bg-gradient-to-r from-[#7c3aed] to-[#6366f1] text-white shadow-xl shadow-purple-500/30' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Team-1
              </button>
              <button 
                onClick={() => setActiveTab('highlights')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'highlights' ? 'bg-gradient-to-r from-[#7c3aed] to-[#6366f1] text-white shadow-xl shadow-purple-500/30' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Team-2
              </button>
            </div>

            {/* Video Player Container */}
            <div className="relative group">
              {isVideoLoading ? (
                <div className="w-full aspect-[16/10] bg-slate-50 animate-pulse rounded-[1.5rem] flex items-center justify-center border border-black/5">
                  <div className="w-10 h-10 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : videoId ? (
                <div className="relative w-full aspect-[16/10] rounded-[1.5rem] overflow-hidden border border-black/5 bg-[#f8f5f0] shadow-2xl transition-all duration-700 ease-in-out group-hover:scale-[1.01]">
                  <iframe
                    key={videoId}
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`}
                    title="CricPlay Video"
                    className="absolute top-0 left-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                  
                  {/* Overlay Badge */}
                  <div className={`absolute top-6 left-6 px-4 py-2 rounded-full text-[9px] font-black tracking-[0.2em] uppercase shadow-2xl border border-white/20 transition-all ${activeTab === 'pre' ? 'bg-[#7c3aed]/90 text-white' : 'bg-[#6366f1]/90 text-white'}`}>
                    {activeTab === 'pre' ? 'Team-1' : 'Team-2'}
                  </div>
                </div>
              ) : (
                <div className="relative w-full aspect-[16/10] rounded-[1.5rem] overflow-hidden border border-black/5 bg-[#ede9fe]/30 flex flex-col items-center justify-center gap-4 text-center p-6">
                   <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl border border-purple-50 p-3">
                     <img src="/logo.png" className="w-full h-full object-contain grayscale opacity-20" />
                   </div>
                   <div>
                    <h3 className="text-[#1e1b4b] font-black tracking-widest uppercase text-xs mb-1">Coming Soon</h3>
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Stay tuned for video updates</p>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Matches Section */}
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-black text-[#1e1b4b] italic tracking-tighter">Upcoming Matches</h2>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-black/5 shadow-sm">
              <span className="text-[10px] font-black text-[#7c3aed] uppercase tracking-widest">IPL 2026</span>
            </div>
          </div>
          
          <div className="grid gap-6">
            {matches.map(match => (
              <Link key={match.id} to={`/match/${match.id}`} className="group relative block bg-white border border-black/5 rounded-[2rem] overflow-hidden hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)] transition-all duration-500 hover:scale-[1.02]">
                <div className="p-4 px-6 bg-[#f8f5f0]/50 border-b border-black/5 flex justify-between items-center group-hover:bg-white transition-colors duration-500">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">T20 Professional League</span>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase transition-all ${match.status === 'live' ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                    {match.status === 'live' && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                    {match.status}
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="flex justify-between items-center relative gap-4">
                    <div className="flex flex-col items-center gap-3 flex-1">
                      <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center p-4 shadow-xl border border-black/[0.03] group-hover:scale-110 transition-transform duration-500">
                        {teams[match.team1] ? (
                          <img src={teams[match.team1]} alt={match.team1} className="w-full h-full object-contain" />
                        ) : (
                          <span className="font-black text-xl text-purple-600">{match.team1.substring(0, 3).toUpperCase()}</span>
                        )}
                      </div>
                      <span className="font-black text-[#1e1b4b] text-sm uppercase tracking-wider">{match.team1}</span>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-[#ede9fe] flex items-center justify-center border border-purple-100 shadow-inner">
                        <span className="font-black text-[10px] text-purple-500 italic">VS</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-3 flex-1">
                      <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center p-4 shadow-xl border border-black/[0.03] group-hover:scale-110 transition-transform duration-500">
                        {teams[match.team2] ? (
                          <img src={teams[match.team2]} alt={match.team2} className="w-full h-full object-contain" />
                        ) : (
                          <span className="font-black text-xl text-purple-600">{match.team2.substring(0, 3).toUpperCase()}</span>
                        )}
                      </div>
                      <span className="font-black text-[#1e1b4b] text-sm uppercase tracking-wider">{match.team2}</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-3 gap-2 bg-[#f8f5f0] p-4 rounded-[1.5rem] border border-black/5 group-hover:bg-purple-50 transition-colors duration-500 shadow-inner">
                    <div className="flex flex-col items-center gap-1">
                      <Calendar className="w-8 h-8 text-purple-500" />
                      <span className="text-[15px] font-black text-[#1e1b4b] uppercase">{match.date}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 border-x border-black/5">
                      <Clock className="w-8 h-8 text-purple-500" />
                      <span className="text-[15px] font-black text-[#1e1b4b] uppercase">{match.time}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <MapPin className="w-8 h-8 text-purple-500" />
                      <span className="text-[12px] font-black text-[#1e1b4b] uppercase truncate w-full text-center px-1">{match.stadium.split(' ')[0]}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-[#7c3aed] to-[#6366f1] p-5 px-8 flex justify-between items-center group-hover:brightness-110 transition-all">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-white/60 uppercase tracking-widest">Contest Entry</span>
                    <span className="text-xl font-black text-white">₹{match.entry_fee}</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full flex items-center gap-2 group-hover:bg-white/30 transition-all border border-white/20">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Join Now</span>
                    <Trophy className="w-4 h-4 text-amber-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {matches.length === 0 && (
            <div className="bg-white rounded-[2rem] border border-black/5 p-12 text-center shadow-md">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-[#ede9fe]" />
              <p className="font-bold text-slate-400 uppercase tracking-widest text-sm italic">No matches scheduled yet</p>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

