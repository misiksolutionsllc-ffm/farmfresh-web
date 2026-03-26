'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/app-store';
import { AppShell } from '@/components/ui/app-shell';
import { MiniStat, BarChart, ProgressBar, Sparkline } from '@/components/ui/charts';
import { cn, formatCurrency, getStatusColor, formatDate } from '@/lib/utils';
import { Gauge, Package, DollarSign, User, Map, Power, Navigation, Star, Zap, Banknote, Clock, MapPin, TrendingUp, ChevronRight } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <Gauge className="w-5 h-5" /> },
  { id: 'deliveries', label: 'Jobs', icon: <Package className="w-5 h-5" /> },
  { id: 'earnings', label: 'Earnings', icon: <DollarSign className="w-5 h-5" /> },
  { id: 'map', label: 'Map', icon: <Map className="w-5 h-5" /> },
  { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
];

export function DriverApp() {
  const { db, dispatch, showToast, currentUserId } = useAppStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const driver = db.users.find((u) => u.id === currentUserId);
  const availableDeliveries = db.deliveries.filter((d) => d.driverId === null && d.status === 'Pending');
  const myDeliveries = db.deliveries.filter((d) => d.driverId === currentUserId);
  const activeDelivery = myDeliveries.find((d) => d.status !== 'Delivered');
  const completedToday = myDeliveries.filter((d) => d.status === 'Delivered').length;

  if (!driver) return null;

  // Fake sparkline data for stats
  const earningsSparkData = [120, 95, 180, 140, 210, 175, (driver.earnings || 0)];
  const tripsSparkData = [5, 8, 6, 12, 9, 14, driver.trips || 0];

  // Weekly earnings for bar chart
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyData = weekDays.map((d, i) => ({ label: d, value: Math.round(Math.random() * 80 + 20 + (i === 6 ? (driver.earnings || 0) / 10 : 0)) }));

  return (
    <AppShell role="driver" navItems={navItems} activeTab={activeTab} onTabChange={setActiveTab}>
      {/* ========== DASHBOARD ========== */}
      {activeTab === 'dashboard' && (
        <div className="space-y-5 pb-24 lg:pb-4">
          {/* Online Toggle */}
          <div className={cn('relative overflow-hidden rounded-3xl p-6 border transition-all duration-500 animate-fade-in', driver.online ? 'bg-gradient-to-br from-blue-600/15 to-blue-900/5 border-blue-500/20' : 'bg-surface-800/50 border-white/5')}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display font-bold text-white">{driver.online ? "You're Online" : "You're Offline"}</h2>
                <p className="text-sm text-slate-400 mt-1">{driver.online ? `${availableDeliveries.length} deliveries available` : 'Go online to start earning'}</p>
                {driver.online && completedToday > 0 && (
                  <div className="flex items-center gap-1.5 mt-2"><span className="badge bg-emerald-500/20 text-emerald-400">{completedToday} completed today</span></div>
                )}
              </div>
              <button onClick={() => { dispatch({ type: 'UPDATE_USER_PROFILE', userId: currentUserId!, updates: { online: !driver.online } }); showToast(driver.online ? 'Going offline' : "You're online!", driver.online ? 'info' : 'success'); }}
                className={cn('w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300', driver.online ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 animate-pulse-glow' : 'bg-surface-800 text-slate-400 border border-white/10 hover:border-white/20')}>
                <Power className="w-7 h-7" />
              </button>
            </div>
            {driver.online && <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />}
          </div>

          {/* Stats with sparklines */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MiniStat label="Earnings" value={formatCurrency(driver.earnings)} icon={<DollarSign className="w-4 h-4" />} color="#10B981" sparkData={earningsSparkData} trend="+12%" trendUp delay={0} />
            <MiniStat label="Trips" value={`${driver.trips || 0}`} icon={<Navigation className="w-4 h-4" />} color="#3B82F6" sparkData={tripsSparkData} trend="+5" trendUp delay={80} />
            <MiniStat label="Rating" value={driver.rating?.toFixed(1) || '–'} icon={<Star className="w-4 h-4" />} color="#F59E0B" delay={160} />
            <MiniStat label="Acceptance" value={`${driver.acceptanceRate || 0}%`} icon={<TrendingUp className="w-4 h-4" />} color="#8B5CF6" delay={240} />
          </div>

          {/* Weekly Earnings Chart */}
          <div className="bg-surface-800/50 border border-white/5 rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <h3 className="font-semibold text-white mb-4">This Week</h3>
            <BarChart data={weeklyData} height={130} color="#3B82F6" />
          </div>

          {/* Active Delivery */}
          {activeDelivery && (
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5 animate-scale-in">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-white">Active Delivery</h3>
                <span className={cn('badge ml-auto', getStatusColor(activeDelivery.status))}>{activeDelivery.status}</span>
              </div>
              {/* Delivery progress */}
              <div className="flex items-center gap-2 mb-4">
                {['Accepted', 'Picked Up', 'Delivered'].map((step, i) => {
                  const stepOrder = ['Accepted', 'Picked Up', 'Delivered'];
                  const currentIdx = stepOrder.indexOf(activeDelivery.status);
                  return (
                    <div key={step} className="flex-1 flex items-center gap-2">
                      <div className={cn('w-full h-2 rounded-full transition-all duration-500', i <= currentIdx ? 'bg-blue-500' : 'bg-white/5')} />
                    </div>
                  );
                })}
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3"><div className="w-3 h-3 rounded-full bg-blue-500 mt-1 animate-pulse" /><div><div className="text-xs text-slate-500">Pickup</div><div className="text-sm text-white">{activeDelivery.pickup}</div></div></div>
                <div className="flex items-start gap-3"><div className="w-3 h-3 rounded-full bg-emerald-500 mt-1" /><div><div className="text-xs text-slate-500">Dropoff</div><div className="text-sm text-white">{activeDelivery.dropoff}</div></div></div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                <div><span className="text-xs text-slate-500">{activeDelivery.distance}</span><span className="text-lg font-bold text-white ml-3">{formatCurrency(activeDelivery.pay)}</span></div>
                {activeDelivery.status === 'Accepted' && <button onClick={() => { dispatch({ type: 'PICKUP_JOB', id: activeDelivery.id }); showToast('Picked up!'); }} className="btn-primary bg-blue-600 text-sm py-2.5">Confirm Pickup</button>}
                {activeDelivery.status === 'Picked Up' && <button onClick={() => { dispatch({ type: 'COMPLETE_JOB', id: activeDelivery.id }); showToast('Delivery complete! 💰'); }} className="btn-primary bg-emerald-600 text-sm py-2.5">Complete</button>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== DELIVERIES TAB ========== */}
      {activeTab === 'deliveries' && (
        <div className="space-y-4 pb-24 lg:pb-4">
          <h2 className="text-xl font-display font-bold text-white">Available ({availableDeliveries.length})</h2>
          {availableDeliveries.length === 0 ? (
            <div className="text-center py-20 animate-fade-in"><span className="text-6xl mb-4 block animate-float">📦</span><p className="text-slate-400">No deliveries available</p></div>
          ) : (
            availableDeliveries.map((d, i) => (
              <div key={d.id} className="bg-surface-800/50 border border-white/5 rounded-2xl p-5 card-hover animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-500 font-mono">#{d.id.slice(-6)}</span>
                  <span className="text-lg font-bold text-emerald-400">{formatCurrency(d.pay)}</span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2"><div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" /><span className="text-sm text-slate-300">{d.pickup}</span></div>
                  <div className="flex items-start gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" /><span className="text-sm text-slate-300">{d.dropoff}</span></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{d.distance}</span>
                  <button onClick={() => { dispatch({ type: 'ACCEPT_JOB', id: d.id, driverId: currentUserId! }); showToast('Delivery accepted!'); }} className="btn-primary bg-blue-600 text-sm py-2.5">Accept</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========== EARNINGS TAB ========== */}
      {activeTab === 'earnings' && (
        <div className="max-w-2xl mx-auto space-y-6 pb-24 lg:pb-4">
          <div className="text-center bg-gradient-to-br from-blue-600/10 to-surface-800/30 border border-blue-500/10 rounded-3xl p-8 animate-fade-in">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Available Balance</div>
            <div className="text-4xl font-bold text-white animate-count-up">{formatCurrency(driver.earnings)}</div>
            <div className="flex items-center justify-center gap-1 mt-2"><Sparkline data={earningsSparkData} width={100} height={30} color="#3B82F6" /></div>
            <button onClick={() => { if ((driver.earnings || 0) > 0) { dispatch({ type: 'DRIVER_PAYOUT', amount: driver.earnings || 0, method: 'bank', driverId: currentUserId! }); showToast('Payout initiated!'); } }} disabled={!driver.earnings || driver.earnings <= 0}
              className="btn-primary bg-blue-600 mt-4 text-sm disabled:bg-slate-700"><Banknote className="w-4 h-4 inline mr-2" />Cash Out</button>
          </div>
          <h3 className="font-semibold text-white">Recent Transactions</h3>
          {db.transactions.length === 0 ? <p className="text-sm text-slate-500 text-center py-8">No transactions</p> : (
            db.transactions.map((tx, i) => (
              <div key={tx.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div><div className="text-sm font-medium text-white">{tx.type}</div><div className="text-xs text-slate-500">{formatDate(tx.date)} • {tx.method}</div></div>
                <div className={cn('font-bold', tx.amount < 0 ? 'text-red-400' : 'text-emerald-400')}>{tx.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(tx.amount))}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========== MAP TAB ========== */}
      {activeTab === 'map' && (
        <div className="space-y-4 pb-24 lg:pb-4 animate-fade-in">
          <div className="bg-surface-800/50 border border-white/5 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-surface-900" />
            <div className="relative text-center"><Map className="w-12 h-12 text-blue-500/30 mx-auto mb-3" /><p className="text-slate-400">Map integration ready</p><p className="text-xs text-slate-600 mt-1">Google Maps / Mapbox</p></div>
          </div>
        </div>
      )}

      {/* ========== PROFILE TAB ========== */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl mx-auto space-y-6 pb-24 lg:pb-4 animate-fade-in">
          <div className="text-center bg-gradient-to-br from-blue-600/10 to-surface-800/30 border border-white/5 rounded-3xl p-8">
            <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse-glow"><span className="text-3xl font-bold text-blue-400">{driver.name.charAt(0)}</span></div>
            <h2 className="text-xl font-bold text-white">{driver.name}</h2>
            <p className="text-sm text-slate-400">{driver.email}</p>
            <div className="flex items-center justify-center gap-1 mt-2"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /><span className="font-semibold text-white">{driver.rating}</span><span className="text-slate-500">• {driver.trips} trips</span></div>
          </div>
          {/* Performance bars */}
          <div className="bg-surface-800/50 border border-white/5 rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-white">Performance</h3>
            <ProgressBar value={driver.acceptanceRate || 0} max={100} color="#3B82F6" label="Acceptance Rate" showValue />
            <ProgressBar value={driver.rating ? driver.rating * 20 : 0} max={100} color="#F59E0B" label="Rating Score" showValue />
            <ProgressBar value={driver.trips || 0} max={200} color="#10B981" label="Trip Goal (200)" showValue />
          </div>
        </div>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <div className="max-w-2xl mx-auto space-y-4 pb-24 lg:pb-4"><h2 className="text-xl font-display font-bold text-white">Notifications</h2><div className="text-center py-20 animate-fade-in"><span className="text-6xl mb-4 block">🔔</span><p className="text-slate-400">No notifications</p></div></div>
      )}
    </AppShell>
  );
}
