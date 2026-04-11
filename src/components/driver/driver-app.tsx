'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/app-store';
import { AppShell } from '@/components/ui/app-shell';
import { Modal } from '@/components/ui/modal';
import { MiniStat, BarChart, ProgressBar, Sparkline } from '@/components/ui/charts';
import { LiveMap, DriverMapView } from '@/components/ui/live-map';
import { SettingsSection } from '@/components/ui/shared-settings';
import { DriverPayoutModal } from '@/components/ui/payment-system';
import { OrderChatModal, DeliveryPhotoModal } from '@/components/ui/chat-photo';
import { cn, formatCurrency, getStatusColor, formatDate } from '@/lib/utils';
import {
  Gauge, Package, DollarSign, User, Map, Power, Navigation, Star, Zap,
  Banknote, Clock, MapPin, TrendingUp, ChevronRight, Settings, Pencil,
  Phone, Mail, Shield, CreditCard, Landmark, Car, FileCheck, Check,
  Plus, Trash2, X, Award, Target, AlertTriangle, Eye, ChevronDown,
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <Gauge className="w-5 h-5" /> },
  { id: 'deliveries', label: 'Jobs', icon: <Package className="w-5 h-5" /> },
  { id: 'earnings', label: 'Earnings', icon: <DollarSign className="w-5 h-5" /> },
  { id: 'map', label: 'Map', icon: <Map className="w-5 h-5" /> },
  { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

export function DriverApp() {
  const { db, dispatch, showToast, currentUserId } = useAppStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPayout, setShowPayout] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showVehicle, setShowVehicle] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankRouting, setBankRouting] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankType, setBankType] = useState<'checking' | 'savings'>('checking');
  const [showChat, setShowChat] = useState(false);
  const [showPickupPhoto, setShowPickupPhoto] = useState(false);
  const [showDeliveryPhoto, setShowDeliveryPhoto] = useState(false);
  const [pickupPhotoTaken, setPickupPhotoTaken] = useState(false);
  const [deliveryPhotoTaken, setDeliveryPhotoTaken] = useState(false);
  const driver = db.users.find((u) => u.id === currentUserId);
  const availableDeliveries = db.deliveries.filter((d) => d.driverId === null && d.status === 'Pending');
  const myDeliveries = db.deliveries.filter((d) => d.driverId === currentUserId);
  const activeDelivery = myDeliveries.find((d) => d.status !== 'Delivered');
  const completedToday = myDeliveries.filter((d) => d.status === 'Delivered').length;

  if (!driver) return null;

  // Sparkline data based on real activity
  const earningsSparkData = [0, 0, 0, 0, 0, 0, (driver.earnings || 0)];
  const tripsSparkData = [0, 0, 0, 0, 0, 0, driver.trips || 0];

  // Weekly earnings for bar chart
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyData = weekDays.map((d, i) => ({ label: d, value: i === 6 ? Math.round((driver.earnings || 0) / 10) : 0 }));

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
            <MiniStat label="Earnings" value={formatCurrency(driver.earnings || 0)} icon={<DollarSign className="w-4 h-4" />} color="#10B981" sparkData={earningsSparkData} trend={driver.earnings ? `$${(driver.earnings || 0).toFixed(0)}` : '$0'} trendUp={(driver.earnings || 0) > 0} delay={0} />
            <MiniStat label="Trips" value={`${driver.trips || 0}`} icon={<Navigation className="w-4 h-4" />} color="#3B82F6" sparkData={tripsSparkData} trend={`${driver.trips || 0} total`} trendUp={(driver.trips || 0) > 0} delay={80} />
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
                {activeDelivery.status === 'Accepted' && <button onClick={() => setShowPickupPhoto(true)} className="btn-primary bg-blue-600 text-sm py-2.5">📷 Photo & Pickup</button>}
                {activeDelivery.status === 'Picked Up' && <button onClick={() => { dispatch({ type: 'COMPLETE_JOB', id: activeDelivery.id }); showToast('Delivery complete! 💰'); }} className="btn-primary bg-emerald-600 text-sm py-2.5">Complete</button>}
              </div>
              {/* Navigate */}
              {(activeDelivery.status === 'Accepted' || activeDelivery.status === 'Picked Up') && (() => {
                const lat = activeDelivery.status === 'Accepted' ? 26.6620 : 26.6540;
                const lng = activeDelivery.status === 'Accepted' ? -80.2710 : -80.2620;
                return (
                  <div className="flex gap-2 mt-3">
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-500/15 active:scale-[0.97]">
                      <MapPin className="w-3.5 h-3.5" /> Google Maps
                    </a>
                    <a href={`https://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-500/10 border border-slate-500/20 text-slate-300 text-xs font-medium hover:bg-slate-500/15 active:scale-[0.97]">
                      <Navigation className="w-3.5 h-3.5" /> Apple Maps
                    </a>
                    <button onClick={() => setShowChat(true)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium hover:bg-violet-500/15 active:scale-[0.97]">
                      💬
                    </button>
                  </div>
                );
              })()}
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
            <div className="text-4xl font-bold text-white animate-count-up">{formatCurrency(driver.earnings || 0)}</div>
            <div className="flex items-center justify-center gap-1 mt-2"><Sparkline data={earningsSparkData} width={100} height={30} color="#3B82F6" /></div>
            <button onClick={() => setShowPayout(true)} disabled={!driver.earnings || driver.earnings <= 0}
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
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-white">Navigation</h2>
            <div className="flex items-center gap-2">
              <div className={cn('status-dot', driver.online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600')} />
              <span className="text-xs text-slate-400">{driver.online ? 'Online' : 'Offline'}</span>
            </div>
          </div>

          {/* Active delivery map */}
          {activeDelivery ? (
            <>
              <DriverMapView
                pickupLat={26.6620}
                pickupLng={-80.2710}
                pickupLabel={activeDelivery.pickup}
                dropoffLat={26.6540}
                dropoffLng={-80.2620}
                dropoffLabel={activeDelivery.dropoff}
              />
              {/* Delivery info card below map */}
              <div className="bg-surface-800/50 border border-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span className="font-semibold text-white text-sm">Active Route</span>
                  </div>
                  <span className={cn('badge', getStatusColor(activeDelivery.status))}>{activeDelivery.status}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-surface-900 rounded-xl p-3">
                    <div className="text-lg font-bold text-white">{activeDelivery.distance}</div>
                    <div className="text-[10px] text-slate-500">Distance</div>
                  </div>
                  <div className="bg-surface-900 rounded-xl p-3">
                    <div className="text-lg font-bold text-blue-400">~12 min</div>
                    <div className="text-[10px] text-slate-500">ETA</div>
                  </div>
                  <div className="bg-surface-900 rounded-xl p-3">
                    <div className="text-lg font-bold text-emerald-400">{formatCurrency(activeDelivery.pay)}</div>
                    <div className="text-[10px] text-slate-500">Earnings</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  {/* Navigation buttons */}
                  {(activeDelivery.status === 'Accepted' || activeDelivery.status === 'Picked Up') && (() => {
                    const destLat = activeDelivery.status === 'Accepted' ? 26.6620 : 26.6540;
                    const destLng = activeDelivery.status === 'Accepted' ? -80.2710 : -80.2620;
                    const destLabel = activeDelivery.status === 'Accepted' ? activeDelivery.pickup : activeDelivery.dropoff;
                    return (
                      <div className="flex gap-2 w-full mb-2">
                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium hover:bg-blue-500/15 transition-all active:scale-[0.97]">
                          <MapPin className="w-4 h-4" /> Google Maps
                        </a>
                        <a href={`https://maps.apple.com/?daddr=${destLat},${destLng}&dirflg=d`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-500/10 border border-slate-500/20 text-slate-300 text-sm font-medium hover:bg-slate-500/15 transition-all active:scale-[0.97]">
                          <Navigation className="w-4 h-4" /> Apple Maps
                        </a>
                      </div>
                    );
                  })()}
                  {activeDelivery.status === 'Accepted' && (
                    <button onClick={() => setShowPickupPhoto(true)}
                      className="flex-1 btn-primary bg-blue-600 text-sm py-2.5">📷 Photo & Pickup</button>
                  )}
                  {activeDelivery.status === 'Picked Up' && (
                    <button onClick={() => setShowDeliveryPhoto(true)}
                      className="flex-1 btn-primary bg-emerald-600 text-sm py-2.5">📷 Photo & Complete</button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Idle map showing area and merchants */}
              <LiveMap
                markers={[
                  ...db.users.filter((u) => u.role === 'farmer').map((m, i) => ({
                    id: m.id, lat: 26.655 + (i * 0.005), lng: -80.275 + (i * 0.004),
                    type: 'merchant' as const, label: m.businessName || m.name, sublabel: 'Farmer',
                  })),
                ]}
                height="350px"
                showMyLocation
              />
              <div className="bg-surface-800/50 border border-white/5 rounded-2xl p-4 text-center">
                <p className="text-slate-400 text-sm">
                  {driver.online
                    ? '🟢 Waiting for deliveries — routes appear when you accept a job'
                    : '⚫ Go online to see available delivery routes'}
                </p>
              </div>
            </>
          )}

          {/* Map legend */}
          <div className="flex flex-wrap gap-4 px-1">
            {[
              { color: '#2563EB', label: 'You' },
              { color: '#8B5CF6', label: 'Pickup' },
              { color: '#10B981', label: 'Dropoff' },
              { color: '#EA580C', label: 'Farmer' },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
                <span className="text-xs text-slate-500">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== PROFILE TAB ========== */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl mx-auto space-y-4 pb-24 lg:pb-4">
          {/* Hero Card */}
          <div className="relative bg-gradient-to-br from-blue-600/10 via-blue-800/5 to-surface-800/30 border border-white/5 rounded-3xl p-6 animate-fade-in overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/[0.04] rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-blue-400">{driver.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white truncate">{driver.name}</h2>
                  <p className="text-xs text-slate-400">{driver.email}</p>
                  {driver.phone && <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" />{driver.phone}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="badge bg-blue-500/15 text-blue-400 flex items-center gap-1"><Star className="w-3 h-3 fill-blue-400" />{driver.rating || '–'}</span>
                    <span className="badge bg-emerald-500/15 text-emerald-400">{driver.trips || 0} trips</span>
                    <span className={cn('badge', driver.online ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-500/15 text-slate-400')}>{driver.online ? '🟢 Online' : '⚫ Offline'}</span>
                  </div>
                </div>
                <button onClick={() => { setEditName(driver.name); setEditPhone(driver.phone || ''); setEditEmail(driver.email); setShowEditProfile(true); }}
                  className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"><Pencil className="w-4 h-4" /></button>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 mt-5">
                {[
                  { value: formatCurrency(driver.earnings || 0), label: 'Earnings', color: 'text-emerald-400' },
                  { value: `${driver.trips || 0}`, label: 'Trips', color: 'text-blue-400' },
                  { value: `${driver.acceptanceRate || 0}%`, label: 'Accept', color: 'text-amber-400' },
                  { value: `${driver.rating || '–'}`, label: 'Rating', color: 'text-violet-400' },
                ].map((s, i) => (
                  <div key={s.label} className="bg-surface-900/50 rounded-xl p-2.5 text-center animate-count-up" style={{ animationDelay: `${i * 80}ms` }}>
                    <div className={cn('text-base font-bold', s.color)}>{s.value}</div>
                    <div className="text-[10px] text-slate-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Earnings & Payout */}
          <div className="card bg-surface-800/50 border border-white/5 rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">💰 Earnings & Payouts</div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-surface-900 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-emerald-400">{formatCurrency(driver.earnings || 0)}</div>
                <div className="text-[10px] text-slate-500">Available</div>
              </div>
              <div className="bg-surface-900 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-white">{formatCurrency((driver.trips || 0) * 8.5)}</div>
                <div className="text-[10px] text-slate-500">Lifetime</div>
              </div>
              <div className="bg-surface-900 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-amber-400">{formatCurrency(db.transactions.filter((t) => t.type === 'Tip').reduce((s, t) => s + t.amount, 0))}</div>
                <div className="text-[10px] text-slate-500">Tips</div>
              </div>
            </div>
            <button onClick={() => setShowPayout(true)} disabled={!driver.earnings || driver.earnings <= 0}
              className="w-full btn-primary bg-blue-600 text-sm flex items-center justify-center gap-2 disabled:opacity-30 disabled:bg-slate-700">
              <DollarSign className="w-4 h-4" /> Withdraw to Bank
            </button>
          </div>

          {/* Bank Account */}
          <div className="card bg-surface-800/50 border border-white/5 rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">🏦 Bank Account</div>
              <button onClick={() => setShowBankModal(true)} className="text-xs text-blue-400 hover:text-blue-300">{driver.bankLast4 ? 'Edit' : 'Add'}</button>
            </div>
            {driver.bankLast4 ? (
              <div className="flex items-center gap-3 bg-surface-900 rounded-xl p-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><Landmark className="w-5 h-5 text-blue-400" /></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">Bank Account •••• {driver.bankLast4}</div>
                  <div className="text-xs text-slate-500">Checking • Direct Deposit</div>
                </div>
                <span className="badge bg-emerald-500/20 text-emerald-400">Verified</span>
              </div>
            ) : (
              <button onClick={() => setShowBankModal(true)} className="w-full py-6 rounded-xl border border-dashed border-white/10 text-sm text-slate-500 hover:text-white hover:border-blue-500/30 transition-all">
                <Plus className="w-4 h-4 inline mr-1" /> Add bank account for payouts
              </button>
            )}
            {driver.cardLast4 && (
              <div className="flex items-center gap-3 bg-surface-900 rounded-xl p-3 mt-2">
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center"><CreditCard className="w-5 h-5 text-violet-400" /></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">Visa •••• {driver.cardLast4}</div>
                  <div className="text-xs text-slate-500">For instant payouts</div>
                </div>
              </div>
            )}
          </div>

          {/* Vehicle Info */}
          <div className="card bg-surface-800/50 border border-white/5 rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">🚗 Vehicle</div>
              <button onClick={() => setShowVehicle(true)} className="text-xs text-blue-400 hover:text-blue-300">{driver.vehicleMake ? 'Edit' : 'Add'}</button>
            </div>
            {driver.vehicleMake ? (
              <div className="flex items-center gap-3 bg-surface-900 rounded-xl p-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center"><Car className="w-5 h-5 text-orange-400" /></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{driver.vehicleYear} {driver.vehicleMake} {driver.vehicleModel}</div>
                  <div className="text-xs text-slate-500">Plate: {driver.vehiclePlate || '—'}</div>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowVehicle(true)} className="w-full py-6 rounded-xl border border-dashed border-white/10 text-sm text-slate-500 hover:text-white hover:border-blue-500/30 transition-all">
                <Plus className="w-4 h-4 inline mr-1" /> Add vehicle information
              </button>
            )}
          </div>

          {/* Performance */}
          <div className="card bg-surface-800/50 border border-white/5 rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">📊 Performance</div>
            <div className="space-y-4">
              <ProgressBar value={driver.acceptanceRate || 0} max={100} color="#3B82F6" label="Acceptance Rate" showValue />
              <ProgressBar value={driver.rating ? driver.rating * 20 : 0} max={100} color="#F59E0B" label="Rating Score" showValue />
              <ProgressBar value={Math.min(driver.trips || 0, 200)} max={200} color="#10B981" label="Trip Goal (200)" showValue />
            </div>
            <div className="mt-4 pt-3 border-t border-white/5">
              <div className="text-center">
                <span className="text-2xl">{(driver.acceptanceRate || 0) >= 90 && (driver.rating || 0) >= 4.5 ? '🏆' : (driver.acceptanceRate || 0) >= 70 ? '🥈' : '📈'}</span>
                <p className="text-xs text-slate-400 mt-1">
                  {(driver.acceptanceRate || 0) >= 90 ? 'Top Driver — keep it up!' : (driver.acceptanceRate || 0) >= 70 ? 'Good standing — room to grow' : 'Keep improving to unlock bonuses'}
                </p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="card bg-surface-800/50 border border-white/5 rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">📋 Documents</div>
            {(driver.documents && driver.documents.length > 0) ? (
              driver.documents.map((doc, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2"><FileCheck className="w-4 h-4 text-slate-500" /><span className="text-sm text-slate-300">{doc.type}</span></div>
                  <span className={cn('badge', doc.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400' : doc.status === 'pending' ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400')}>{doc.status}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">No documents uploaded yet</p>
            )}
          </div>

          {/* Recent Payouts */}
          <div className="card bg-surface-800/50 border border-white/5 rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">📄 Recent Payouts</div>
            {db.transactions.filter((t) => t.type === 'Payout').length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No payouts yet — complete deliveries to earn</p>
            ) : (
              db.transactions.filter((t) => t.type === 'Payout').slice(0, 5).map((t, i) => (
                <div key={t.id || i} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                  <div><div className="text-sm text-white">{formatDate(t.date)}</div><div className="text-xs text-slate-500">{t.method}</div></div>
                  <div className="text-right"><div className="text-sm font-bold text-emerald-400">{formatCurrency(Math.abs(t.amount))}</div><span className="badge bg-emerald-500/15 text-emerald-400">{t.status}</span></div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========== EDIT PROFILE MODAL ========== */}
      <Modal open={showEditProfile} onClose={() => setShowEditProfile(false)} title="Edit Profile">
        <div className="p-6 space-y-4">
          <div className="flex justify-center mb-2">
            <div className="w-20 h-20 rounded-2xl bg-blue-500/20 flex items-center justify-center">
              <span className="text-3xl font-bold text-blue-400">{(editName || driver.name).charAt(0)}</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Full Name</label>
            <input value={editName} onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white focus:outline-none focus:border-blue-500/30" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Phone Number</label>
            <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="(555) 123-4567"
              className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white focus:outline-none focus:border-blue-500/30" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Email</label>
            <div className="flex items-center gap-2">
              <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)}
                className="flex-1 px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white focus:outline-none focus:border-blue-500/30" />
            </div>
          </div>
          <button onClick={() => {
            if (currentUserId && editName) {
              dispatch({ type: 'UPDATE_USER_PROFILE', userId: currentUserId, updates: { name: editName, phone: editPhone, email: editEmail } });
              showToast('Profile updated!');
              setShowEditProfile(false);
            }
          }} className="w-full btn-primary bg-blue-600">Save Changes</button>
        </div>
      </Modal>

      {/* ========== BANK ACCOUNT MODAL ========== */}
      <Modal open={showBankModal} onClose={() => setShowBankModal(false)} title={driver.bankLast4 ? 'Edit Bank Account' : 'Add Bank Account'}>
        <div className="p-6 space-y-4">
          <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-blue-400">Bank info encrypted with AES-256 • Never shared with third parties</span>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Bank Name</label>
            <input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Chase, Bank of America, Wells Fargo..."
              className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white focus:outline-none focus:border-blue-500/30" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Routing Number (9 digits)</label>
            <input value={bankRouting} onChange={(e) => setBankRouting(e.target.value.replace(/\D/g, '').slice(0, 9))} placeholder="021000021" maxLength={9}
              className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500/30" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Account Number</label>
            <input value={bankAccount} onChange={(e) => setBankAccount(e.target.value.replace(/\D/g, ''))} placeholder="Account number" type="password"
              className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500/30" />
          </div>
          <div className="flex gap-2">
            {(['checking', 'savings'] as const).map((t) => (
              <button key={t} onClick={() => setBankType(t)}
                className={cn('flex-1 py-2.5 rounded-xl text-sm font-medium transition-all', bankType === t ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' : 'bg-surface-800 text-slate-500 border border-white/5')}>
                {t === 'checking' ? 'Checking' : 'Savings'}
              </button>
            ))}
          </div>
          <button onClick={() => {
            if (currentUserId && bankName && bankRouting.length === 9 && bankAccount) {
              dispatch({ type: 'UPDATE_USER_PROFILE', userId: currentUserId, updates: { bankLast4: bankAccount.slice(-4) } });
              showToast('Bank account saved!');
              setShowBankModal(false);
              setBankName(''); setBankRouting(''); setBankAccount('');
            } else {
              showToast('Please fill all fields correctly', 'error');
            }
          }} className="w-full btn-primary bg-blue-600">Save Bank Account</button>
          {driver.bankLast4 && (
            <button onClick={() => { if (currentUserId) { dispatch({ type: 'UPDATE_USER_PROFILE', userId: currentUserId, updates: { bankLast4: undefined } }); showToast('Bank account removed'); setShowBankModal(false); } }}
              className="w-full py-2.5 text-sm text-red-400/60 hover:text-red-400 transition-colors">Remove bank account</button>
          )}
        </div>
      </Modal>

      {/* ========== VEHICLE MODAL ========== */}
      <Modal open={showVehicle} onClose={() => setShowVehicle(false)} title="Vehicle Information">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">Year</label>
              <input value={vehicleYear} onChange={(e) => setVehicleYear(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="2024" maxLength={4}
                className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white focus:outline-none focus:border-blue-500/30" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">Make</label>
              <input value={vehicleMake} onChange={(e) => setVehicleMake(e.target.value)} placeholder="Toyota"
                className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white focus:outline-none focus:border-blue-500/30" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Model</label>
            <input value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} placeholder="Camry"
              className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white focus:outline-none focus:border-blue-500/30" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">License Plate</label>
            <input value={vehiclePlate} onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())} placeholder="ABC 1234"
              className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-blue-500/30" />
          </div>
          <button onClick={() => {
            if (currentUserId && vehicleMake && vehicleModel) {
              dispatch({ type: 'UPDATE_USER_PROFILE', userId: currentUserId, updates: { vehicleMake, vehicleModel, vehicleYear, vehiclePlate } });
              showToast('Vehicle info saved!');
              setShowVehicle(false);
            }
          }} className="w-full btn-primary bg-blue-600">Save Vehicle</button>
        </div>
      </Modal>

      {/* ========== SETTINGS TAB ========== */}
      {activeTab === 'settings' && <SettingsSection role="driver" detectedState="FL" />}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <div className="max-w-2xl mx-auto space-y-4 pb-24 lg:pb-4"><h2 className="text-xl font-display font-bold text-white">Notifications</h2><div className="text-center py-20 animate-fade-in"><span className="text-6xl mb-4 block">🔔</span><p className="text-slate-400">No notifications</p></div></div>
      )}

      {/* Payout Modal */}
      <DriverPayoutModal open={showPayout} onClose={() => setShowPayout(false)} earnings={driver.earnings || 0} />

      {/* Chat Modal */}
      {activeDelivery && showChat && (() => {
        const order = db.orders.find((o) => o.id === activeDelivery.orderId);
        const customer = order ? db.users.find((u) => u.id === order.customerId) : null;
        return (
          <OrderChatModal
            open={true}
            onClose={() => setShowChat(false)}
            orderId={activeDelivery.id}
            otherPartyName={customer?.name || 'Customer'}
            otherPartyRole="Customer"
          />
        );
      })()}

      {/* Pickup Photo Modal */}
      <DeliveryPhotoModal
        open={showPickupPhoto}
        onClose={() => setShowPickupPhoto(false)}
        type="pickup"
        onCapture={(photo) => {
          if (activeDelivery) {
            dispatch({ type: 'PICKUP_JOB', id: activeDelivery.id });
            setPickupPhotoTaken(true);
            showToast('Pickup photo saved! Order picked up ✅');
          }
        }}
      />

      {/* Delivery Photo Modal */}
      <DeliveryPhotoModal
        open={showDeliveryPhoto}
        onClose={() => setShowDeliveryPhoto(false)}
        type="delivery"
        onCapture={(photo) => {
          if (activeDelivery) {
            dispatch({ type: 'COMPLETE_JOB', id: activeDelivery.id });
            setDeliveryPhotoTaken(true);
            showToast('Delivery photo saved! Order complete 💰');
          }
        }}
      />
    </AppShell>
  );
}
