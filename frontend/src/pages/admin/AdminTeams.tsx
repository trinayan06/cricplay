import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { AdminLayout } from './AdminDashboard';
import { Upload, Image as ImageIcon, Trash2, ShieldCheck, Link as LinkIcon, Plus, History, Loader2 } from 'lucide-react';
import { BASE_URL } from '@/src/lib/api';

export default function AdminTeams() {
  const [teams, setTeams] = useState<Record<string, string>>({});
  const [newTeamName, setNewTeamName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/teams`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setTeams(data || {});
    } catch(err) {
      console.error(err);
      setTeams({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return alert('Team name is required');
    if (!logoUrl.trim() && !file) return alert('Please provide an image URL or upload a file');

    setLoading(true);
    const formData = new FormData();
    formData.append('name', newTeamName.toUpperCase());
    if (logoUrl) formData.append('logo_url', logoUrl);
    if (file) formData.append('logo', file);

    try {
      const res = await fetch(`${BASE_URL}/api/admin/teams`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        alert('Team logo saved successfully');
        setNewTeamName('');
        setLogoUrl('');
        setFile(null);
        fetchTeams();
      } else {
        alert('Failed to save team logo');
      }
    } catch(err) {
      alert('Error saving logo');
    }
    setLoading(false);
  };

  const handleDelete = async (teamName: string) => {
    if (!confirm(`Are you sure you want to delete the logo for ${teamName}?`)) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/teams/${teamName}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchTeams();
      } else {
        alert('Failed to delete team logo');
      }
    } catch(err) {
      alert('Error deleting logo');
    }
    setLoading(false);
  };

  return (
    <AdminLayout title="Visual Identity">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 pb-20">
        {/* Left Column: Asset Injection */}
        <div className="bg-white border border-black/5 p-10 rounded-[3rem] shadow-sm relative overflow-hidden h-fit">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#7c3aed]/5 rounded-full blur-[80px] -mr-32 -mt-32" />
          
          <h3 className="text-xl font-black text-[#1e1b4b] mb-8 uppercase tracking-tight italic flex items-center gap-3">
             <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center shadow-sm">
               <Plus className="w-6 h-6 text-[#7c3aed]" />
             </div>
             Register Brand Asset
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legacy Identifier (e.g. MI, CSK)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#f8f5f0] flex items-center justify-center border border-black/5">
                   <ShieldCheck className="w-4 h-4 text-[#7c3aed]" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="TEAM CODE"
                  className="w-full bg-[#f8f5f0]/50 border border-black/5 rounded-2xl pl-14 pr-5 py-4 text-[#1e1b4b] font-black uppercase text-sm focus:outline-none focus:ring-4 focus:ring-purple-100/50 shadow-inner"
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Remote Resource URL</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#f8f5f0] flex items-center justify-center border border-black/5">
                   <LinkIcon className="w-4 h-4 text-[#6366f1]" />
                </div>
                <input
                  type="text"
                  className="w-full bg-[#f8f5f0]/50 border border-black/5 rounded-2xl pl-14 pr-5 py-4 text-[#1e1b4b] font-bold text-sm focus:outline-none focus:ring-4 focus:ring-purple-100/50 shadow-inner"
                  value={logoUrl}
                  onChange={e => { setLogoUrl(e.target.value); setFile(null); }}
                  placeholder="https://assets.domain.com/logo.png"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 py-2">
               <div className="flex-1 h-[1px] bg-black/5" />
               <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Hardware Sync</span>
               <div className="flex-1 h-[1px] bg-black/5" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Direct Media Upload</label>
              <div className="relative border-2 border-dashed border-black/[0.03] rounded-[2rem] p-8 text-center bg-[#f8f5f0]/30 hover:border-[#7c3aed]/20 transition-all cursor-pointer group/upload">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  onChange={e => {
                    const f = e.target.files?.[0] || null;
                    if (f) { setFile(f); setLogoUrl(''); }
                  }}
                />
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-black/5 shadow-sm group-hover/upload:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-[#7c3aed]" />
                </div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                  {file ? <span className="text-[#6366f1]">{file.name}</span> : <>Relay local file <br/> <span className="text-[9px] opacity-40 italic">PNF, JPG, SVG supported</span></>}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#7c3aed] to-[#6366f1] hover:brightness-110 disabled:grayscale disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-xl shadow-purple-500/25 transition-all active:scale-95 uppercase tracking-widest text-[11px] mt-4 flex items-center justify-center gap-3"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Synchronize Identity'}
            </button>
          </form>
        </div>

        {/* Right Column: Registry Viewer */}
        <div className="bg-white border border-black/5 p-10 rounded-[3rem] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -mr-32 -mt-32" />
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h3 className="text-xl font-black text-[#1e1b4b] uppercase tracking-tight italic flex items-center gap-3">
               <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shadow-sm">
                 <History className="w-6 h-6 text-emerald-500" />
               </div>
               Identity Registry
            </h3>
            <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 uppercase tracking-widest">{Object.keys(teams).length} Active Tokens</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {Object.entries(teams).map(([name, url]) => (
              <div key={name} className="relative flex flex-col items-center p-6 bg-[#f8f5f0]/50 rounded-[2rem] border border-black/[0.03] group hover:bg-white hover:shadow-xl hover:shadow-black/[0.03] transition-all duration-500">
                <button 
                  onClick={() => handleDelete(name)}
                  className="absolute top-3 right-3 w-9 h-9 bg-white text-slate-300 hover:text-red-500 rounded-full flex items-center justify-center transition-all border border-black/5 shadow-inner opacity-0 group-hover:opacity-100 active:scale-90"
                  title="Purge Legacy"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 border border-black/[0.03] shadow-inner p-4 group-hover:scale-110 transition-transform">
                  {url ? (
                    <img src={url} alt={name} className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-200" />
                  )}
                </div>
                <span className="font-black text-[#1e1b4b] text-base uppercase italic tracking-tighter">{name}</span>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-60">Verified Code</p>
              </div>
            ))}
            {Object.keys(teams).length === 0 && (
              <div className="col-span-full py-20 text-center">
                <div className="w-16 h-16 bg-[#f8f5f0] rounded-full flex items-center justify-center mx-auto mb-4 border border-black/5 shadow-inner">
                  <ImageIcon className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic opacity-50">Local Registry Inactive</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
