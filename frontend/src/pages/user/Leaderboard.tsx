import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ChevronLeft, Trophy, Medal, IndianRupee, Wallet, Smartphone, Send, CheckCircle, X, Loader2 } from 'lucide-react';
import { BASE_URL } from '@/src/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '../../components/BottomNav';

export default function Leaderboard() {
  const { id } = useParams();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [match, setMatch] = useState<any>(null);
  const [logos, setLogos] = useState<Record<string, string>>({});
  const [userWithdrawalStatus, setUserWithdrawalStatus] = useState<string | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [phone, setPhone] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { token, user } = useAuthStore();

  useEffect(() => {
    Promise.all([
      fetch(`${BASE_URL}/api/matches/${id}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
      fetch(`${BASE_URL}/api/teams`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json())
    ]).then(([matchData, logosData]) => {
      setMatch(matchData?.match || null);
      setLogos(logosData || {});
    }).catch(err => console.error('Initial Fetch Error:', err));

    const fetchLeaderboard = () => {
      fetch(`${BASE_URL}/api/leaderboard/${id}`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          setLeaderboard(Array.isArray(data) ? data : []);
        })
        .catch(err => {
          console.error('Leaderboard Fetch Error:', err);
          setLeaderboard([]);
        });

      fetch(`${BASE_URL}/api/user/withdrawal-status/${id}`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          setUserWithdrawalStatus(data?.status || null);
        })
        .catch(err => {
          console.error('Status Fetch Error:', err);
        });
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [id, token]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const rank = leaderboard.findIndex(e => e.user_id === user?.id) + 1;
      const amount = rank === 1 ? 80 : rank === 2 ? 50 : rank === 3 ? 30 : 25;
      
      const res = await fetch(`${BASE_URL}/api/withdrawals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id,
          upi_id: upiId,
          phone: phone,
          amount: amount
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Success");
        setUserWithdrawalStatus('pending');
        setTimeout(() => {
          setShowWithdrawModal(false);
          setSuccessMsg('');
        }, 3000);
      } else {
        alert("Failed to withdraw");
      }
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!match) return <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center text-[#1e1b4b] font-black italic">LOADING SCORES...</div>;

  const userRank = leaderboard.findIndex(e => e.user_id === user?.id) + 1;
  const isWinner = userRank > 0 && userRank <= 4;
  const canWithdraw = isWinner && !userWithdrawalStatus;

  return (
    <div className="min-h-screen bg-[#f8f5f0] pb-36 font-sans">
      <header className="bg-white/80 backdrop-blur-xl border-b border-black/5 sticky top-0 z-40 transition-all">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-8 h-8 flex items-center justify-center bg-[#f8f5f0] rounded-full text-slate-400 hover:text-[#7c3aed] transition-colors border border-black/5">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-black text-[#1e1b4b] tracking-tighter">Leaderboard</h1>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {logos[match.team1] ? <img src={logos[match.team1]} alt={match.team1} className="w-4 h-4 object-contain" /> : match.team1}
                <span className="text-[#6366f1] italic">VS</span>
                {logos[match.team2] ? <img src={logos[match.team2]} alt={match.team2} className="w-4 h-4 object-contain" /> : match.team2}
              </div>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${match.status === 'live' ? 'bg-red-50 text-red-500 border-red-100 animate-pulse' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
            {match.status}
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6 mt-2">
        {/* Prize Pool Card */}
        <section className="bg-white border border-black/5 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] relative group hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#7c3aed] to-[#6366f1]" />
          <div className="relative p-8">
            <h2 className="text-xl font-black text-[#1e1b4b] mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center shadow-sm border border-amber-100">
                <Trophy className="w-5 h-5 text-amber-500" />
              </div>
              Contest Rewards
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { rank: '1st', color: 'amber', prize: '80' },
                { rank: '2nd', color: 'slate', prize: '50' },
                { rank: '3rd', color: 'orange', prize: '30' },
                { rank: '4th', color: 'blue', prize: '25' }
              ].map((p, i) => (
                <div key={i} className="bg-[#f8f5f0]/50 border border-black/[0.03] p-5 rounded-[1.5rem] flex flex-col items-center group/item hover:bg-white hover:shadow-lg transition-all duration-300">
                  <div className={`w-12 h-12 bg-${p.color}-50 rounded-full flex items-center justify-center mb-3 border border-${p.color}-100 shadow-inner group-hover/item:scale-110 transition-transform`}>
                    <Medal className={`w-7 h-7 text-${p.color === 'slate' ? 'slate-400' : p.color + '-500'}`} />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">{p.rank} Position</span>
                  <span className="text-2xl font-black text-[#1e1b4b]">₹{p.prize}</span>
                </div>
              ))}
            </div>

            {canWithdraw && (
              <button 
                onClick={() => setShowWithdrawModal(true)}
                className="w-full mt-8 bg-gradient-to-r from-[#7c3aed] to-[#6366f1] hover:brightness-110 text-white font-black py-4 rounded-[1.25rem] transition-all shadow-xl shadow-purple-500/25 flex items-center justify-center gap-3 group active:scale-95"
              >
                <Wallet className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                CLAIM WINNINGS
              </button>
            )}

            {isWinner && userWithdrawalStatus && (
              <div className={`mt-8 ${userWithdrawalStatus === 'paid' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'} border p-4 rounded-[1.25rem] flex items-center justify-center gap-3`}>
                <CheckCircle className="w-5 h-5" />
                <span className="font-black text-[10px] uppercase tracking-widest">
                  {userWithdrawalStatus === 'paid' ? 'Rewards Processed' : 'Processing Request...'}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Leaderboard Table Section */}
        <section className="bg-white border border-black/5 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)]">
          <div className="bg-[#ede9fe]/30 p-4 px-6 border-b border-black/5 flex justify-between items-center">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Rank & Participant</span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Pts</span>
          </div>
          
          <div className="divide-y divide-black/[0.03]">
            {leaderboard.map((entry, index) => {
              const isCurrentUser = entry.user_id === user?.id;
              const rank = index + 1;
              
              return (
                <div 
                  key={entry.id} 
                  className={`p-5 flex items-center justify-between transition-all ${isCurrentUser ? 'bg-[#7c3aed]/5 border-l-4 border-[#7c3aed]' : 'hover:bg-[#f8f5f0]'}`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shadow-sm ${
                      rank === 1 ? 'bg-amber-500 text-white shadow-amber-500/20' :
                      rank === 2 ? 'bg-slate-200 text-slate-600' :
                      rank === 3 ? 'bg-amber-700 text-white shadow-amber-700/20' :
                      'bg-slate-50 text-slate-400 border border-black/5'
                    }`}>
                      {rank === 1 ? <Trophy className="w-5 h-5" /> : rank === 2 || rank === 3 ? <Medal className="w-5 h-5" /> : rank}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`font-black uppercase tracking-tight ${isCurrentUser ? 'text-[#7c3aed]' : 'text-[#1e1b4b]'}`}>
                          {entry.name} {isCurrentUser && '(You)'}
                        </p>
                        {rank <= 4 && (
                          <span className="flex items-center gap-1 text-[8px] font-black text-[#6366f1] bg-[#6366f1]/5 px-2 py-0.5 rounded-full border border-[#6366f1]/10 tracking-widest uppercase">
                            WINNER
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                        Classic Team
                      </p>
                    </div>
                  </div>
                  <div className={`font-black text-xl tracking-tighter ${isCurrentUser ? 'text-[#7c3aed]' : 'text-[#1e1b4b]'}`}>
                    {entry.points}
                  </div>
                </div>
              );
            })}
            
            {leaderboard.length === 0 && (
              <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px] italic">
                Calculating Match Points...
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1e1b4b]/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full relative overflow-hidden border border-black/5"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#7c3aed] to-[#6366f1]" />
              
              <button 
                onClick={() => !isSubmitting && setShowWithdrawModal(false)}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-[#f8f5f0] flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center mb-8">
                <div className="w-20 h-20 bg-blue-50 rounded-[1.5rem] flex items-center justify-center mb-4 border border-blue-100 shadow-inner">
                  <Wallet className="w-10 h-10 text-blue-500" />
                </div>
                <h2 className="text-2xl font-black text-[#1e1b4b] text-center tracking-tighter">Claim Reward</h2>
                <div className="mt-2 px-4 py-1.5 bg-[#f8f5f0] rounded-full border border-black/5">
                  <p className="text-[#6366f1] font-black text-xs uppercase tracking-widest">Amount: ₹{userRank === 1 ? '80' : userRank === 2 ? '50' : userRank === 3 ? '30' : '25'}</p>
                </div>
              </div>

              {successMsg ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border border-green-100 p-8 rounded-[2rem] text-center"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl border border-green-50">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <p className="text-green-600 font-bold uppercase tracking-widest text-xs mb-1">Request Sent!</p>
                  <p className="text-slate-400 text-[10px] font-bold uppercase">Processing within 2 mins</p>
                </motion.div>
              ) : (
                <form onSubmit={handleWithdraw} className="space-y-5">
                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Payment Method (UPI)</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#f8f5f0] flex items-center justify-center border border-black/5 group-focus-within:border-blue-200 transition-all">
                        <Smartphone className="w-4 h-4 text-blue-500" />
                      </div>
                      <input 
                        required
                        type="text"
                        placeholder="yourname@upi"
                        className="w-full bg-[#f8f5f0]/50 border border-black/5 rounded-2xl py-4 pl-14 pr-4 text-[#1e1b4b] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:bg-white transition-all font-bold text-sm shadow-inner"
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Contact Details</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#f8f5f0] flex items-center justify-center border border-black/5 group-focus-within:border-blue-200 transition-all">
                        <Send className="w-4 h-4 text-blue-500" />
                      </div>
                      <input 
                        required
                        type="tel"
                        placeholder="WhatsApp number"
                        className="w-full bg-[#f8f5f0]/50 border border-black/5 rounded-2xl py-4 pl-14 pr-4 text-[#1e1b4b] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:bg-white transition-all font-bold text-sm shadow-inner"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <button 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#7c3aed] to-[#6366f1] hover:scale-[1.02] active:scale-95 disabled:grayscale text-white font-black py-4 rounded-2xl mt-4 flex items-center justify-center gap-3 transition-all shadow-xl shadow-purple-500/20"
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <IndianRupee className="w-5 h-5" />
                        PROCEED TO PAYOUT
                      </>
                    )}
                  </button>
                  <p className="text-center text-[9px] font-bold text-red-400 uppercase tracking-widest opacity-60">*Ensure UPI ID is active</p>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <BottomNav />
    </div>
  );
}

