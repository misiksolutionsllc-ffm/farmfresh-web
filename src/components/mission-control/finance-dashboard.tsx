'use client';
import { useAppStore } from '@/lib/app-store';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, TrendingUp, CreditCard, Wallet } from 'lucide-react';
export function FinanceDashboard() {
  const { db } = useAppStore();
  const delivered = db.orders.filter(o=>o.status==='Delivered');
  const rev = delivered.reduce((s,o)=>s+o.total,0);
  const fees = delivered.reduce((s,o)=>s+o.fees.platform,0);
  const tips = delivered.reduce((s,o)=>s+(o.fees.tip||0),0);
  const delivery = delivered.reduce((s,o)=>s+o.fees.delivery,0);
  const stats = [
    { label: 'Total Revenue', value: formatCurrency(rev), icon: DollarSign, color: '#10B981' },
    { label: 'Platform Fees', value: formatCurrency(fees), icon: TrendingUp, color: '#8B5CF6' },
    { label: 'Delivery Fees', value: formatCurrency(delivery), icon: CreditCard, color: '#3B82F6' },
    { label: 'Driver Tips', value: formatCurrency(tips), icon: Wallet, color: '#F59E0B' },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => { const Icon = s.icon; return (
          <div key={s.label} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
            <Icon className="w-5 h-5 mb-3" style={{color:s.color}} /><div className="text-2xl font-bold text-white font-mono">{s.value}</div><div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        )})}
      </div>
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
        <h3 className="font-bold text-white mb-4">Fee Configuration (current)</h3>
        <div className="grid grid-cols-2 gap-4">
          {[['Platform Fee', `${db.settings.platformFeePercent}%`], ['Delivery Base', formatCurrency(db.settings.deliveryBaseFee)], ['Tax Rate', `${(db.settings.taxRate*100).toFixed(1)}%`], ['Membership', `${formatCurrency(db.settings.membershipPrice)}/mo`]].map(([l,v]) => (
            <div key={l as string} className="flex justify-between p-3 bg-surface-900/30 rounded-xl"><span className="text-sm text-slate-400">{l}</span><span className="text-sm font-bold text-white font-mono">{v}</span></div>
          ))}
        </div>
      </div>
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
        <h3 className="font-bold text-white mb-3">Transactions</h3>
        {db.transactions.length===0 ? <p className="text-sm text-slate-500 text-center py-8">No transactions</p> :
          db.transactions.slice(-10).reverse().map((t,i) => (
            <div key={t.id||i} className="flex justify-between py-2 border-b border-white/5 last:border-0">
              <div><span className="text-sm text-white">{t.type}</span><span className="text-xs text-slate-500 ml-2">{t.method}</span></div>
              <span className={`text-sm font-mono ${t.amount<0?'text-red-400':'text-emerald-400'}`}>{t.amount<0?'-':'+'}{formatCurrency(Math.abs(t.amount))}</span>
            </div>
          ))
        }
      </div>
    </div>
  );
}
