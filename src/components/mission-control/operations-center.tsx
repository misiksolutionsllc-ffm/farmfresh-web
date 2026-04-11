'use client';
import { useAppStore } from '@/lib/app-store';
import { cn } from '@/lib/utils';
import { Package, Truck, Clock, CheckCircle } from 'lucide-react';
export function OperationsCenter() {
  const { db } = useAppStore();
  const byStatus = (s:string) => db.orders.filter(o=>o.status===s).length;
  const statuses = [
    { label: 'Pending', count: byStatus('Pending'), icon: Clock, color: '#F59E0B' },
    { label: 'Processing', count: byStatus('Processing'), icon: Package, color: '#3B82F6' },
    { label: 'Ready', count: byStatus('Ready'), icon: Truck, color: '#8B5CF6' },
    { label: 'Delivered', count: byStatus('Delivered'), icon: CheckCircle, color: '#10B981' },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statuses.map(s => { const Icon = s.icon; return (
          <div key={s.label} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 text-center">
            <Icon className="w-6 h-6 mx-auto mb-2" style={{color:s.color}} /><div className="text-3xl font-bold text-white">{s.count}</div><div className="text-xs text-slate-500">{s.label}</div>
          </div>
        )})}
      </div>
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
        <h3 className="font-bold text-white mb-3">Active Deliveries</h3>
        {db.deliveries.filter(d=>d.status!=='Delivered').length===0 ? <p className="text-sm text-slate-500 text-center py-8">No active deliveries</p> :
          db.deliveries.filter(d=>d.status!=='Delivered').map(d => (
            <div key={d.id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
              <span className="text-xs font-mono text-slate-400">#{d.id.slice(-6)}</span>
              <span className={cn('text-xs px-2 py-0.5 rounded-full', d.status==='Pending'?'bg-amber-500/15 text-amber-400':'bg-blue-500/15 text-blue-400')}>{d.status}</span>
            </div>
          ))
        }
      </div>
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
        <h3 className="font-bold text-white mb-3">Online Drivers</h3>
        {db.users.filter(u=>u.role==='driver'&&u.online).length===0 ? <p className="text-sm text-slate-500 text-center py-8">No drivers online</p> :
          db.users.filter(u=>u.role==='driver'&&u.online).map(d => (
            <div key={d.id} className="flex items-center gap-2 py-2 border-b border-white/5 last:border-0">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-white">{d.name}</span>
              <span className="text-xs text-slate-500 ml-auto">{d.trips||0} trips</span>
            </div>
          ))
        }
      </div>
    </div>
  );
}
