'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/app-store';
import { cn, formatCurrency } from '@/lib/utils';
import { Users, Search, Shield, AlertTriangle } from 'lucide-react';
export function UserManagement() {
  const { db, dispatch, showToast } = useAppStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const filtered = db.users.filter(u => {
    if (filter !== 'all' && u.role !== filter) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users..." className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/30" /></div>
        <select value={filter} onChange={e=>setFilter(e.target.value)} className="px-3 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm focus:outline-none">
          <option value="all">All Roles</option><option value="customer">Consumer</option><option value="driver">Driver</option><option value="farmer">Farmer</option><option value="owner">Admin</option>
        </select>
      </div>
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        {filtered.map(u => (
          <div key={u.id} className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center"><span className="text-sm font-bold text-blue-400">{u.name.charAt(0)}</span></div>
              <div><div className="text-sm text-white font-medium">{u.name}</div><div className="text-xs text-slate-500">{u.email}</div></div>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn('text-xs px-2 py-0.5 rounded-full', u.role==='customer'?'bg-emerald-500/15 text-emerald-400':u.role==='driver'?'bg-blue-500/15 text-blue-400':u.role==='farmer'?'bg-orange-500/15 text-orange-400':'bg-red-500/15 text-red-400')}>{u.role}</span>
              <span className={cn('text-xs px-2 py-0.5 rounded-full', u.status==='active'?'bg-emerald-500/15 text-emerald-400':'bg-red-500/15 text-red-400')}>{u.status}</span>
              {u.status === 'active' ?
                <button onClick={()=>{dispatch({type:'UPDATE_USER_STATUS',userId:u.id,status:'banned'});showToast(`${u.name} banned`)}} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/5">Ban</button> :
                <button onClick={()=>{dispatch({type:'UPDATE_USER_STATUS',userId:u.id,status:'active'});showToast(`${u.name} reactivated`)}} className="text-xs text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded hover:bg-emerald-500/5">Activate</button>
              }
            </div>
          </div>
        ))}
        {filtered.length===0 && <p className="text-sm text-slate-500 text-center py-12">No users found</p>}
      </div>
    </div>
  );
}
