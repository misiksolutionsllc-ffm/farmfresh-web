'use client';
import { useAppStore } from '@/lib/app-store';
import { cn, formatCurrency } from '@/lib/utils';
import { Users, Package, DollarSign, TrendingUp, Truck, Store, ShoppingCart, AlertTriangle } from 'lucide-react';
export function CommandDashboard() {
  const { db } = useAppStore();
  const rev = db.orders.filter(o=>o.status==='Delivered').reduce((s,o)=>s+o.total,0);
  const fees = db.orders.filter(o=>o.status==='Delivered').reduce((s,o)=>s+o.fees.platform,0);
  const stats = [
    { label: 'Revenue', value: formatCurrency(rev), icon: DollarSign, color: '#10B981' },
    { label: 'Platform Fees', value: formatCurrency(fees), icon: TrendingUp, color: '#8B5CF6' },
    { label: 'Users', value: `${db.users.length}`, icon: Users, color: '#3B82F6' },
    { label: 'Orders', value: `${db.orders.length}`, icon: Package, color: '#EA580C' },
  ];
  const roles = [
    { label: 'Consumers', count: db.users.filter(u=>u.role==='customer').length, icon: ShoppingCart, color: '#059669' },
    { label: 'Drivers', count: db.users.filter(u=>u.role==='driver').length, icon: Truck, color: '#2563EB' },
    { label: 'Farmers', count: db.users.filter(u=>u.role==='farmer').length, icon: Store, color: '#EA580C' },
  ];
  return (
    <div className="space-y-6">
      {db.settings.maintenanceMode && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3"><AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" /><span className="text-sm text-red-400 font-bold">MAINTENANCE MODE ACTIVE</span></div>}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => { const Icon = s.icon; return (
          <div key={s.label} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
            <Icon className="w-5 h-5 mb-3" style={{color:s.color}} />
            <div className="text-2xl font-bold text-white font-mono">{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        )})}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {roles.map(r => { const Icon = r.icon; return (
          <div key={r.label} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 text-center">
            <Icon className="w-6 h-6 mx-auto mb-2" style={{color:r.color}} />
            <div className="text-3xl font-bold text-white">{r.count}</div>
            <div className="text-xs text-slate-500">{r.label}</div>
          </div>
        )})}
      </div>
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
        <h3 className="font-bold text-white mb-3">Recent Orders</h3>
        {db.orders.length === 0 ? <p className="text-sm text-slate-500 text-center py-8">No orders yet</p> :
          db.orders.slice(-5).reverse().map(o => (
            <div key={o.id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
              <div><span className="text-xs font-mono text-slate-400">#{o.id.slice(-6).toUpperCase()}</span><span className={cn('ml-2 text-xs px-2 py-0.5 rounded-full', o.status==='Delivered'?'bg-emerald-500/15 text-emerald-400':o.status==='Pending'?'bg-amber-500/15 text-amber-400':'bg-blue-500/15 text-blue-400')}>{o.status}</span></div>
              <span className="text-sm font-mono text-white">{formatCurrency(o.total)}</span>
            </div>
          ))
        }
      </div>
    </div>
  );
}
