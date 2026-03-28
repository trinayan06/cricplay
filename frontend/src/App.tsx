import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// User Pages
import Home from './pages/user/Home';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Verify from './pages/auth/Verify';
import MatchDetails from './pages/user/MatchDetails';
import Contest from './pages/user/Contest';
import Leaderboard from './pages/user/Leaderboard';
import LeaderboardList from './pages/user/LeaderboardList';
import Profile from './pages/user/Profile';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMatches from './pages/admin/AdminMatches';
import AdminPlayers from './pages/admin/AdminPlayers';
import AdminScores from './pages/admin/AdminScores';
import AdminPayments from './pages/admin/AdminPayments';
import AdminLeaderboard from './pages/admin/AdminLeaderboard';
import AdminTeams from './pages/admin/AdminTeams';
import AdminUsers from './pages/admin/AdminUsers';

const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { user, token } = useAuthStore();
  
  if (!token || !user) {
    return <Navigate to={requireAdmin ? "/dnt" : "/login"} />;
  }
  
  if (requireAdmin && user.is_admin !== 1) {
    return <Navigate to="/" />;
  }
  
  if (!requireAdmin && user.is_admin === 0 && user.is_verified === 0 && window.location.pathname !== '/verify') {
    return <Navigate to="/verify" />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <div className="min-h-screen bg-[#f8f5f0] text-[#1e1b4b] font-sans selection:bg-purple-500/30">
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<ProtectedRoute><Verify /></ProtectedRoute>} />
        
        {/* User Routes */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/match/:id" element={<ProtectedRoute><MatchDetails /></ProtectedRoute>} />
        <Route path="/contest/:id" element={<ProtectedRoute><Contest /></ProtectedRoute>} />
        <Route path="/leaderboard/:id" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/leaderboard-list" element={<ProtectedRoute><LeaderboardList /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/dnt" element={<AdminLogin />} />
        <Route path="/dnt/dashboard" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
        <Route path="/dnt/matches" element={<ProtectedRoute requireAdmin><AdminMatches /></ProtectedRoute>} />
        <Route path="/dnt/players/:matchId" element={<ProtectedRoute requireAdmin><AdminPlayers /></ProtectedRoute>} />
        <Route path="/dnt/scores/:matchId" element={<ProtectedRoute requireAdmin><AdminScores /></ProtectedRoute>} />
        <Route path="/dnt/payments" element={<ProtectedRoute requireAdmin><AdminPayments /></ProtectedRoute>} />
        <Route path="/dnt/leaderboard/:id" element={<ProtectedRoute requireAdmin><AdminLeaderboard /></ProtectedRoute>} />
        <Route path="/dnt/teams" element={<ProtectedRoute requireAdmin><AdminTeams /></ProtectedRoute>} />
        <Route path="/dnt/users" element={<ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}
