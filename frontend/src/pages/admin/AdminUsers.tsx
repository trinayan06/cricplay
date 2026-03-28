import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminDashboard';
import { useAuthStore } from '../../store/authStore';
import { Search, ArrowUpDown, Edit, Trash2, User, Mail, Phone, Calendar, X, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BASE_URL } from '@/src/lib/api';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });
  const [isLoading, setIsLoading] = useState(false);
  const token = useAuthStore(state => state.token);

  const fetchUsers = () => {
    fetch(`${BASE_URL}/api/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error('Users Fetch Error:', err);
        setUsers([]);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const filteredUsers = users
    .filter(u => 
      u.name.toLowerCase().includes(search.toLowerCase()) || 
      u.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email, phone: user.phone });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await fetch(`${BASE_URL}/api/admin/users/${editingUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(editForm)
    });
    setEditingUser(null);
    fetchUsers();
    setIsLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this user? All their matches and payments will be removed.')) {
      await fetch(`${BASE_URL}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchUsers();
    }
  };

  return (
    <AdminLayout title="User Logistics">
      <div className="mb-10 flex flex-col md:flex-row gap-6 justify-between items-end">
        <div className="relative w-full md:w-[450px] group">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Database Query</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#7c3aed] transition-colors" />
            <input 
              type="text" 
              placeholder="Search user identity or digital address..."
              className="w-full bg-white border border-black/5 rounded-2xl pl-12 pr-6 py-4 text-[#1e1b4b] font-bold text-sm focus:outline-none focus:ring-4 focus:ring-purple-100/50 shadow-sm transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <button 
          onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
          className="bg-white border border-black/5 hover:border-purple-200 text-[#1e1b4b] px-6 py-4 rounded-2xl flex items-center gap-3 transition-all shadow-sm font-black text-[10px] uppercase tracking-widest active:scale-95 group"
        >
          <ArrowUpDown className={`w-4 h-4 text-[#7c3aed] transition-transform duration-500 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} /> 
          Chronological: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
        </button>
      </div>

      <div className="bg-white border border-black/5 rounded-[3rem] overflow-hidden shadow-[0_30px_70px_-20px_rgba(0,0,0,0.04)] mb-20 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -mr-32 -mt-32" />
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f8f5f0]/30 border-b border-black/[0.03]">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Identity</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Contact Grid</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Enlistment Date</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right pr-12">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03]">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-[#f8f5f0]/20 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-black/5 shadow-inner group-hover:scale-110 transition-transform">
                        <User className="w-6 h-6 text-[#7c3aed]" />
                      </div>
                      <div>
                         <p className="text-[#1e1b4b] font-black uppercase italic tracking-tight text-lg leading-none">{u.name}</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1.5 italic">
                           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Verified Citizen
                         </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-[#6366f1]" /> {u.email}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-[#6366f1]" /> {u.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#f8f5f0] rounded-xl border border-black/[0.03]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'LEGACY'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right pr-12">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                      <button onClick={() => handleEdit(u)} className="p-3 bg-white border border-black/5 text-slate-400 hover:text-[#7c3aed] hover:border-[#7c3aed]/20 rounded-xl transition-all shadow-sm active:scale-90">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="p-3 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-100 shadow-sm active:scale-90">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-32 text-center text-slate-400">
                     <div className="w-16 h-16 bg-[#f8f5f0] rounded-full flex items-center justify-center mx-auto mb-4 border border-black/5 shadow-inner">
                        <Search className="w-8 h-8 text-slate-200" />
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-widest italic opacity-60">No digital signatures matched your query.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Overlay */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 bg-[#1e1b4b]/60 backdrop-blur-md flex items-center justify-center z-50 p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white border border-black/5 p-12 rounded-[3.5rem] w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#7c3aed] to-[#6366f1]" />
              
              <button onClick={() => setEditingUser(null)} className="absolute top-8 right-8 w-11 h-11 bg-[#f8f5f0] text-slate-400 hover:text-red-500 rounded-full flex items-center justify-center transition-all border border-black/5 shadow-inner">
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-black text-[#1e1b4b] mb-10 uppercase tracking-tight italic flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shadow-sm">
                   <Edit className="w-7 h-7 text-[#6366f1]" />
                 </div>
                 Modify Profile
              </h3>

              <form onSubmit={handleUpdate} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Identity (Name)</label>
                  <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-[#f8f5f0]/50 border border-black/5 rounded-2xl py-4 px-5 text-[#1e1b4b] font-black focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all shadow-inner" required />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Digital Address (Email)</label>
                  <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full bg-[#f8f5f0]/50 border border-black/5 rounded-2xl py-4 px-5 text-[#1e1b4b] font-black focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all shadow-inner" required />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mobile Access (Phone)</label>
                  <input type="text" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full bg-[#f8f5f0]/50 border border-black/5 rounded-2xl py-4 px-5 text-[#1e1b4b] font-black focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all shadow-inner" required />
                </div>
                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => setEditingUser(null)} className="flex-1 px-6 py-4 rounded-2xl border border-black/5 text-slate-400 font-black uppercase tracking-widest text-[10px] transition-all hover:bg-[#f8f5f0]">Cancel</button>
                  <button type="submit" disabled={isLoading} className="flex-1 bg-gradient-to-r from-[#7c3aed] to-[#6366f1] hover:brightness-110 text-white font-black py-4 rounded-2xl shadow-xl shadow-purple-500/25 transition-all outline-none active:scale-95 uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Commit Changes</>}
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
