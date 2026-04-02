'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/app-store';
import { AppShell } from '@/components/ui/app-shell';
import { ConfirmDialog } from '@/components/ui/modal';
import { MiniStat, DonutChart, BarChart, ProgressBar, Sparkline } from '@/components/ui/charts';
import { GodModeMapView } from '@/components/ui/live-map';
import { SettingsSection } from '@/components/ui/shared-settings';
import { cn, formatCurrency, getStatusColor, formatDate, getRoleLabel } from '@/lib/utils';
import { BarChart3, Users, Settings, Database, Shield, Activity, DollarSign, Package, Truck, Store, ShoppingCart, UserCheck, UserX, AlertTriangle, Trash2, ToggleLeft, ToggleRight, Eye, Zap, TrendingUp, MapPin } from 'lucide-react';

const navItems = [
  { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'livemap', label: 'Live Map', icon: <MapPin className="w-5 h-5" /> },
  { id: 'users', label: 'Users', icon: <Users className="w-5 h-5" /> },
  { id: 'orders', label: 'Orders', icon: <Package className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  { id: 'database', label: 'Database', icon: <Database className="w-5 h-5" /> },
];

export function AdminApp() {
  const { db, dispatch, showToast } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [showNukeDialog, setShowNukeDialog] = useState(false);

  const totalRevenue = db.orders.filter((o) => o.status === 'Delivered').reduce((s, o) => s + o.total, 0);
  const platformFees = db.orders.filter((o) => o.status === 'Delivered').reduce((s, o) => s + o.fees.platform, 0);
  const deliveredCount = db.orders.filter((o) => o.status === 'Delivered').length;
  const pendingCount = db.orders.filter((o) => o.status === 'Pending' || o.status === 'Processing').length;

  const revenueSparkData = [320, 450, 380, 520, 490, 610, totalRevenue || 700];

  const orderStatusSegments = [
    { value: deliveredCount, color: '#10B981', label: 'Delivered' },
    { value: pendingCount, color: '#F59E0B', label: 'Active' },
    { value: db.orders.filter((o) => o.status === 'Cancelled').length, color: '#EF4444', label: 'Cancelled' },
  ];

  const userRoleData = [
    { label: '🛒', value: db.users.filter((u) => u.role === 'customer').length },
    { label: '🚗', value: db.users.filter((u) => u.role === 'driver').length },
    { label: '🏪', value: db.users.filter((u) => u.role === 'farmer').length },
    { label: '🛡️', value: db.users.filter((u) => u.role === 'owner').length },
  ];

  return (
    <AppShell role="owner" navItems={navItems} activeTab={activeTab} onTabChange={setActiveTab} title={activeTab === 'overview' ? '🛡️ God Mode' : undefined}>
      {/* ========== OVERVIEW ========== */}
      {activeTab === 'overview' && (
        <div className="space-y-5 pb-24 lg:pb-4">
          {/* Header banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-red-600/15 via-red-800/5 to-surface-900 border border-red-500/10 rounded-3xl p-6 animate-fade-in">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1"><Zap className="w-4 h-4 text-red-400" /><span className="text-sm text-red-400 font-medium">Platform Overview</span></div>
              <h2 className="text-2xl font-display font-bold text-white">Real-time metrics</h2>
            </div>
            <div className="absolute right-4 top-2 text-6xl opacity-10 animate-float">⚡</div>
          </div>

          {/* Stats with sparklines */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MiniStat label="Total Revenue" value={formatCurrency(totalRevenue)} icon={<DollarSign className="w-4 h-4" />} color="#10B981" sparkData={revenueSparkData} trend="+23%" trendUp delay={0} />
            <MiniStat label="Platform Fees" value={formatCurrency(platformFees)} icon={<Activity className="w-4 h-4" />} color="#DC2626" trend="+15%" trendUp delay={80} />
            <MiniStat label="Users" value={`${db.users.length}`} icon={<Users className="w-4 h-4" />} color="#3B82F6" delay={160} />
            <MiniStat label="Orders" value={`${db.orders.length}`} icon={<Package className="w-4 h-4" />} color="#EA580C" delay={240} />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Order Status Donut */}
            <div className="bg-surface-800/50 border border-white/5 rounded-2xl p-5 flex flex-col items-center animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <h3 className="font-semibold text-white mb-4 self-start">Order Status</h3>
              <DonutChart segments={orderStatusSegments} size={140} strokeWidth={18}>
                <span className="text-3xl font-bold text-white">{db.orders.length}</span>
                <span className="text-[10px] text-slate-500">total</span>
              </DonutChart>
              <div className="flex gap-4 mt-4">
                {orderStatusSegments.filter((s) => s.value > 0).map((s) => (
                  <div key={s.label} className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} /><span className="text-xs text-slate-400">{s.label} ({s.value})</span></div>
                ))}
              </div>
            </div>
            {/* Users by Role */}
            <div className="bg-surface-800/50 border border-white/5 rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <h3 className="font-semibold text-white mb-4">Users by Role</h3>
              <BarChart data={userRoleData} height={140} color="#DC2626" />
            </div>
          </div>

          {/* User breakdown cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Customers', count: db.users.filter((u) => u.role === 'customer').length, icon: <ShoppingCart className="w-4 h-4" />, color: '#059669' },
              { label: 'Drivers', count: db.users.filter((u) => u.role === 'driver').length, icon: <Truck className="w-4 h-4" />, color: '#2563EB' },
              { label: 'Farmers', count: db.users.filter((u) => u.role === 'farmer').length, icon: <Store className="w-4 h-4" />, color: '#EA580C' },
              { label: 'Products', count: db.products.length, icon: <Package className="w-4 h-4" />, color: '#8B5CF6' },
            ].map((item, i) => (
              <div key={item.label} className="rounded-2xl p-4 flex items-center gap-3 animate-fade-in-up stat-glow" style={{ backgroundColor: item.color + '08', animationDelay: `${500 + i * 60}ms`, color: item.color }}>
                <div style={{ color: item.color }}>{item.icon}</div>
                <div><div className="text-xl font-bold text-white">{item.count}</div><div className="text-xs text-slate-400">{item.label}</div></div>
              </div>
            ))}
          </div>

          {/* Recent Orders */}
          <div className="bg-surface-800/50 border border-white/5 rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
            <h3 className="font-semibold text-white mb-4">Recent Orders</h3>
            {db.orders.slice(0, 5).map((order, i) => (
              <div key={order.id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0 animate-fade-in-up" style={{ animationDelay: `${800 + i * 50}ms` }}>
                <div><span className="text-xs text-slate-500 font-mono">#{order.id.slice(-6)}</span><div className="text-sm text-white">{order.items.length} items</div></div>
                <div className="flex items-center gap-3"><span className={cn('badge', getStatusColor(order.status))}>{order.status}</span><span className="text-sm font-bold text-white">{formatCurrency(order.total)}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== LIVE MAP ========== */}
      {activeTab === 'livemap' && (
        <div className="space-y-5 pb-24 lg:pb-4">
          <div className="flex items-center justify-between animate-fade-in">
            <h2 className="text-xl font-display font-bold text-white">Live Map</h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="status-dot bg-blue-500 animate-pulse" />
                <span className="text-xs text-slate-400">{db.users.filter((u) => u.role === 'driver' && u.online).length} drivers online</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="status-dot bg-orange-500" />
                <span className="text-xs text-slate-400">{db.users.filter((u) => u.role === 'farmer').length} merchants</span>
              </div>
            </div>
          </div>

          {/* Full map */}
          <GodModeMapView
            drivers={db.users.filter((u) => u.role === 'driver').map((d) => {
              const loc = db.driverLocations.find((l) => l.driverId === d.id);
              return {
                id: d.id,
                name: d.name,
                lat: loc?.latitude || 26.655 + Math.random() * 0.025,
                lng: loc?.longitude || -80.275 + Math.random() * 0.025,
                online: d.online,
              };
            })}
            merchants={db.users.filter((u) => u.role === 'farmer').map((m) => ({
              id: m.id,
              name: m.name,
              lat: m.address ? 26.66 + Math.random() * 0.015 : 26.655,
              lng: m.address ? -80.27 + Math.random() * 0.015 : -80.268,
            }))}
            deliveries={db.deliveries.map((d) => ({
              id: d.id,
              pickupLat: 26.66 + Math.random() * 0.02,
              pickupLng: -80.275 + Math.random() * 0.02,
              dropoffLat: 26.65 + Math.random() * 0.02,
              dropoffLng: -80.260 + Math.random() * 0.02,
              status: d.status,
            }))}
          />

          {/* Stats under map */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Active Deliveries', value: db.deliveries.filter((d) => d.status !== 'Delivered').length, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Online Drivers', value: db.users.filter((u) => u.role === 'driver' && u.online).length, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Pending Orders', value: db.orders.filter((o) => o.status === 'Pending').length, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { label: 'Farmers', value: db.users.filter((u) => u.role === 'farmer').length, color: 'text-orange-400', bg: 'bg-orange-500/10' },
            ].map((s, i) => (
              <div key={s.label} className={cn('rounded-2xl p-4 border border-white/5 animate-fade-in-up', s.bg)} style={{ animationDelay: `${i * 60}ms` }}>
                <div className={cn('text-2xl font-bold', s.color)}>{s.value}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Active delivery list */}
          {db.deliveries.filter((d) => d.status !== 'Delivered').length > 0 && (
            <div className="bg-surface-800/50 border border-white/5 rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <h3 className="font-semibold text-white mb-3">Active Deliveries</h3>
              {db.deliveries.filter((d) => d.status !== 'Delivered').map((d, i) => (
                <div key={d.id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                  <div>
                    <span className="text-xs text-slate-500 font-mono">#{d.id.slice(-6)}</span>
                    <div className="text-sm text-slate-300">{d.pickup} → {d.dropoff}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('badge', getStatusColor(d.status))}>{d.status}</span>
                    <span className="text-sm font-bold text-white">{formatCurrency(d.pay)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Map legend */}
          <div className="flex flex-wrap gap-4 px-1">
            {[
              { color: '#2563EB', label: 'Drivers (online)', dot: true },
              { color: '#EA580C', label: 'Farmers' },
              { color: '#F59E0B', label: 'Pending route' },
              { color: '#3B82F6', label: 'Active route' },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={cn('w-3 h-3 rounded-full', l.dot && 'animate-pulse')} style={{ backgroundColor: l.color }} />
                <span className="text-xs text-slate-500">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== USERS ========== */}
      {activeTab === 'users' && (
        <div className="space-y-4 pb-24 lg:pb-4">
          <h2 className="text-xl font-display font-bold text-white animate-fade-in">User Management</h2>
          <div className="overflow-x-auto">
            <div className="space-y-2 min-w-[600px]">
              <div className="grid grid-cols-6 gap-4 px-4 py-2 text-xs text-slate-500 uppercase tracking-wider"><span>User</span><span>Role</span><span>Status</span><span>Verified</span><span>Joined</span><span>Actions</span></div>
              {db.users.map((user, i) => (
                <div key={user.id} className="grid grid-cols-6 gap-4 items-center bg-surface-800/50 border border-white/5 rounded-xl px-4 py-3 hover:border-white/10 transition-all animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <div><div className="text-sm font-medium text-white truncate">{user.name}</div><div className="text-xs text-slate-500 truncate">{user.email}</div></div>
                  <span className="badge w-fit" style={{ backgroundColor: ({'customer':'#059669','driver':'#2563EB','farmer':'#EA580C','owner':'#DC2626'}[user.role] || '#64748B') + '20', color: ({'customer':'#34d399','driver':'#60a5fa','farmer':'#fb923c','owner':'#f87171'}[user.role] || '#94a3b8') }}>{getRoleLabel(user.role)}</span>
                  <span className={cn('badge w-fit', getStatusColor(user.status))}>{user.status}</span>
                  <span>{user.verified ? <UserCheck className="w-4 h-4 text-emerald-400" /> : <UserX className="w-4 h-4 text-slate-600" />}</span>
                  <span className="text-xs text-slate-500">{user.createdAt ? formatDate(user.createdAt) : '–'}</span>
                  <button onClick={() => { dispatch({ type: 'UPDATE_USER_STATUS', userId: user.id, status: user.status === 'active' ? 'banned' : 'active' }); showToast(`User ${user.status === 'active' ? 'banned' : 'unbanned'}`); }}
                    className={cn('p-1.5 rounded-lg transition-all', user.status === 'active' ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/5' : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/5')}>
                    {user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========== ORDERS ========== */}
      {activeTab === 'orders' && (
        <div className="space-y-4 pb-24 lg:pb-4">
          <h2 className="text-xl font-display font-bold text-white">All Orders ({db.orders.length})</h2>
          {db.orders.map((order, i) => (
            <div key={order.id} className="bg-surface-800/50 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all animate-fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex items-center justify-between mb-2"><span className="text-xs text-slate-500 font-mono">#{order.id.slice(-6).toUpperCase()}</span><span className={cn('badge', getStatusColor(order.status))}>{order.status}</span></div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><div className="text-xs text-slate-500">Customer</div><div className="text-white">{db.users.find((u) => u.id === order.customerId)?.name || '–'}</div></div>
                <div><div className="text-xs text-slate-500">Merchant</div><div className="text-white">{db.users.find((u) => u.id === order.merchantId)?.name || '–'}</div></div>
                <div><div className="text-xs text-slate-500">Total</div><div className="font-bold text-white">{formatCurrency(order.total)}</div></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========== SETTINGS ========== */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl mx-auto space-y-4 pb-24 lg:pb-4">
          <h2 className="text-xl font-display font-bold text-white animate-fade-in">Platform Settings</h2>
          {/* Maintenance Mode */}
          <div className={cn('p-5 rounded-2xl border flex items-center justify-between transition-all duration-500 animate-fade-in-up', db.settings.maintenanceMode ? 'bg-red-500/5 border-red-500/20' : 'bg-surface-800/50 border-white/5')}>
            <div className="flex items-center gap-3">
              <AlertTriangle className={cn('w-5 h-5 transition-colors', db.settings.maintenanceMode ? 'text-red-400 animate-pulse' : 'text-slate-500')} />
              <div><div className="font-semibold text-white">Maintenance Mode</div><div className="text-xs text-slate-500">Lock platform for all users</div></div>
            </div>
            <button onClick={() => { dispatch({ type: 'UPDATE_SETTING', key: 'maintenanceMode', value: !db.settings.maintenanceMode }); showToast(db.settings.maintenanceMode ? 'System unlocked' : 'System locked!', db.settings.maintenanceMode ? 'success' : 'error'); }} className="p-2">
              {db.settings.maintenanceMode ? <ToggleRight className="w-8 h-8 text-red-400" /> : <ToggleLeft className="w-8 h-8 text-slate-500" />}
            </button>
          </div>
          {/* Fee sliders */}
          {[
            { key: 'platformFeePercent' as const, label: 'Platform Fee (%)', min: 0, max: 30, step: 1, format: (v: number) => `${v}%` },
            { key: 'deliveryBaseFee' as const, label: 'Delivery Base Fee', min: 0, max: 20, step: 0.5, format: (v: number) => formatCurrency(v) },
            { key: 'taxRate' as const, label: 'Tax Rate', min: 0, max: 0.2, step: 0.01, format: (v: number) => `${(v * 100).toFixed(0)}%` },
            { key: 'membershipPrice' as const, label: 'Membership Price', min: 0, max: 50, step: 1, format: (v: number) => formatCurrency(v) },
          ].map((s, i) => (
            <div key={s.key} className="bg-surface-800/50 border border-white/5 rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: `${(i + 1) * 80}ms` }}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-white">{s.label}</span>
                <span className="text-lg font-bold text-red-400">{s.format(Number(db.settings[s.key]))}</span>
              </div>
              <input type="range" min={s.min} max={s.max} step={s.step} value={Number(db.settings[s.key])} onChange={(e) => dispatch({ type: 'UPDATE_SETTING', key: s.key, value: parseFloat(e.target.value) })} className="w-full accent-red-500" />
            </div>
          ))}

          {/* Legal & Account */}
          <div className="pt-4 border-t border-white/5">
            <h3 className="text-sm font-bold text-slate-400 mb-3">Legal, Privacy & Account</h3>
          </div>
          <SettingsSection role="owner" detectedState="FL" />
        </div>
      )}

      {/* ========== DATABASE ========== */}
      {activeTab === 'database' && (
        <div className="space-y-6 pb-24 lg:pb-4">
          <div className="flex items-center justify-between animate-fade-in">
            <h2 className="text-xl font-display font-bold text-white">Database</h2>
            <button onClick={() => setShowNukeDialog(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/5 transition-all text-sm"><Trash2 className="w-4 h-4" />Nuke Data</button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label: 'Users', count: db.users.length }, { label: 'Products', count: db.products.length }, { label: 'Orders', count: db.orders.length },
              { label: 'Deliveries', count: db.deliveries.length }, { label: 'Reviews', count: db.reviews.length }, { label: 'Promos', count: db.promos.length },
              { label: 'Notifications', count: db.notifications.length }, { label: 'Audit Logs', count: db.auditLogs.length }, { label: 'Transactions', count: db.transactions.length },
            ].map((item, i) => (
              <div key={item.label} className="bg-surface-800/50 border border-white/5 rounded-xl p-4 flex items-center justify-between animate-fade-in-up hover:border-white/10 transition-all" style={{ animationDelay: `${i * 40}ms` }}>
                <span className="text-sm text-slate-400">{item.label}</span>
                <span className="text-lg font-bold text-white font-mono animate-count-up" style={{ animationDelay: `${i * 40 + 200}ms` }}>{item.count}</span>
              </div>
            ))}
          </div>
          <div className="bg-surface-800/50 border border-white/5 rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <h3 className="text-sm text-slate-400 mb-2">Settings JSON</h3>
            <pre className="text-xs text-slate-500 max-h-60 overflow-auto font-mono bg-surface-950 rounded-xl p-4">{JSON.stringify(db.settings, null, 2)}</pre>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="max-w-2xl mx-auto space-y-4 pb-24 lg:pb-4">
          <h2 className="text-xl font-display font-bold text-white">Audit Log</h2>
          {db.auditLogs.length === 0 ? <p className="text-sm text-slate-500 text-center py-12">No entries</p> : (
            db.auditLogs.slice(0, 20).map((log, i) => (
              <div key={log.id} className="text-xs text-slate-400 py-2 border-b border-white/5 last:border-0 animate-fade-in-up" style={{ animationDelay: `${i * 30}ms` }}>
                <span className="text-slate-500">{formatDate(log.timestamp)}</span>{' — '}<span className="text-white">{log.action}</span>{log.userName && <span> by {log.userName}</span>}
              </div>
            ))
          )}
        </div>
      )}

      {/* Nuke Confirm Dialog */}
      <ConfirmDialog open={showNukeDialog} onClose={() => setShowNukeDialog(false)} onConfirm={() => { dispatch({ type: 'NUKE_DATA' }); showToast('Data nuked!', 'error'); }}
        title="Nuke Data?" message="This will delete all orders, deliveries, transactions, and reviews. This cannot be undone." confirmLabel="Nuke" destructive />
    </AppShell>
  );
}
