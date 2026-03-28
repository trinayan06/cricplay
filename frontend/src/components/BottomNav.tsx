import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Trophy, User } from 'lucide-react';

export default function BottomNav() {
  return (
    <nav className="fixed bottom-10 left-0 right-0 z-40 px-4 pointer-events-none">
       <div className="max-w-md mx-auto h-16 bg-white/95 backdrop-blur-xl border border-black/5 rounded-2xl flex justify-between items-center px-8 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] pointer-events-auto">
        <NavLink 
          to="/" 
          className={({ isActive }) => `flex flex-col items-center transition-all ${isActive ? 'text-purple-600 scale-110 drop-shadow-[0_0_8px_rgba(124,58,237,0.3)]' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px] font-black mt-1 uppercase tracking-widest">Home</span>
        </NavLink>
        
        <NavLink 
          to="/leaderboard-list" 
          className={({ isActive }) => `flex flex-col items-center transition-all relative group ${isActive ? 'text-amber-500 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Trophy className="w-5 h-5 text-inherit" />
          <span className="text-[9px] font-black mt-1 uppercase tracking-widest text-inherit">Winners</span>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </NavLink>
        
        <NavLink 
          to="/profile" 
          className={({ isActive }) => `flex flex-col items-center transition-all ${isActive ? 'text-blue-500 scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <User className="w-5 h-5" />
          <span className="text-[9px] font-black mt-1 uppercase tracking-widest">Profile</span>
        </NavLink>
      </div>
    </nav>
  );
}
