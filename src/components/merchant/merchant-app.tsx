'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/app-store';
import { AppShell } from '@/components/ui/app-shell';
import { Modal } from '@/components/ui/modal';
import { MiniStat, BarChart, DonutChart, ProgressBar } from '@/components/ui/charts';
import { cn, formatCurrency, getStatusColor, formatDate } from '@/lib/utils';
import { Product } from '@/lib/store';
import { ClipboardList, Package, BarChart3, User, Star, Plus, Pencil, Trash2, DollarSign, ShoppingBag, CheckCircle2, TrendingUp, X } from 'lucide-react';

const navItems = [
  { id: 'orders', label: 'Orders', icon: <ClipboardList className="w-5 h-5" /> },
  { id: 'inventory', label: 'Inventory', icon: <Package className="w-5 h-5" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'reviews', label: 'Reviews', icon: <Star className="w-5 h-5" /> },
  { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
];

export function MerchantApp() {
  const { db, dispatch, showToast, currentUserId } = useAppStore();
  const [activeTab, setActiveTab] = useState('orders');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', price: '', unit: 'lb', category: 'Vegetables', stock: '', description: '' });

  const merchant = db.users.find((u) => u.id === currentUserId);
  const myProducts = db.products.filter((p) => p.farmerId === currentUserId);
  const myOrders = db.orders.filter((o) => o.merchantId === currentUserId);
  const pendingCount = myOrders.filter((o) => o.status === 'Pending' || o.status === 'Processing').length;
  const myReviews = db.reviews.filter((r) => myProducts.some((p) => p.id === r.productId));
  const totalRevenue = myOrders.filter((o) => o.status === 'Delivered').reduce((sum, o) => sum + o.fees.subtotal, 0);
  const totalSales = myProducts.reduce((s, p) => s + p.sales, 0);

  // Chart data
  const categoryData = ['Fruits', 'Vegetables', 'Dairy', 'Bakery'].map((cat) => {
    const catProducts = myProducts.filter((p) => p.category === cat);
    return { label: cat, value: catProducts.reduce((s, p) => s + p.sales, 0) };
  }).filter((d) => d.value > 0);

  const donutSegments = [
    { value: myOrders.filter((o) => o.status === 'Delivered').length, color: '#10B981', label: 'Delivered' },
    { value: myOrders.filter((o) => o.status === 'Pending' || o.status === 'Processing').length, color: '#F59E0B', label: 'Active' },
    { value: myOrders.filter((o) => o.status === 'Cancelled').length, color: '#EF4444', label: 'Cancelled' },
  ];

  const handleSave = () => {
    if (!form.name || !form.price) return;
    if (editProduct) {
      dispatch({ type: 'UPDATE_PRODUCT', payload: { id: editProduct.id, name: form.name, price: parseFloat(form.price), unit: form.unit, category: form.category, stock: parseInt(form.stock) || 0, description: form.description } });
      showToast('Product updated');
    } else {
      dispatch({ type: 'ADD_PRODUCT', payload: { farmerId: currentUserId!, name: form.name, price: parseFloat(form.price), unit: form.unit, category: form.category, stock: parseInt(form.stock) || 50, description: form.description } });
      showToast('Product added!');
    }
    closeForm();
  };

  const closeForm = () => { setShowAddProduct(false); setEditProduct(null); setForm({ name: '', price: '', unit: 'lb', category: 'Vegetables', stock: '', description: '' }); };
  const openEdit = (p: Product) => { setEditProduct(p); setForm({ name: p.name, price: p.price.toString(), unit: p.unit, category: p.category, stock: p.stock.toString(), description: p.description || '' }); setShowAddProduct(true); };

  if (!merchant) return null;

  return (
    <AppShell role="farmer" navItems={navItems} activeTab={activeTab} onTabChange={setActiveTab}>
      {/* ========== ORDERS ========== */}
      {activeTab === 'orders' && (
        <div className="space-y-4 pb-24 lg:pb-4">
          <div className="flex items-center justify-between animate-fade-in">
            <h2 className="text-xl font-display font-bold text-white">Orders</h2>
            {pendingCount > 0 && <span className="badge bg-amber-500/20 text-amber-400 animate-pulse">{pendingCount} pending</span>}
          </div>
          {myOrders.length === 0 ? <div className="text-center py-20 animate-fade-in"><span className="text-6xl mb-4 block animate-float">📋</span><p className="text-slate-400">No orders yet</p></div> : (
            myOrders.map((order, i) => (
              <div key={order.id} className={cn('bg-surface-800/50 border rounded-2xl p-5 transition-all animate-fade-in-up', order.status === 'Pending' ? 'border-amber-500/20' : 'border-white/5')} style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-center justify-between mb-3">
                  <div><span className="text-xs text-slate-500 font-mono">#{order.id.slice(-6).toUpperCase()}</span><div className="text-xs text-slate-500 mt-0.5">{formatDate(order.date)}</div></div>
                  <span className={cn('badge', getStatusColor(order.status))}>{order.status}</span>
                </div>
                <div className="space-y-1.5 mb-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm"><span className="text-slate-300">{item.image} {item.name} × {item.qty}</span><span className="text-slate-400">{formatCurrency(item.price * item.qty)}</span></div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="font-bold text-white">{formatCurrency(order.fees.subtotal)}</span>
                  {order.status === 'Pending' && (
                    <button onClick={() => { dispatch({ type: 'UPDATE_ORDER', payload: { id: order.id, status: 'Processing' } }); showToast('Order accepted'); }}
                      className="btn-primary bg-orange-600 text-sm py-2">Accept</button>
                  )}
                  {order.status === 'Processing' && (
                    <button onClick={() => { dispatch({ type: 'MARK_READY', id: order.id }); showToast('Marked ready!'); }}
                      className="btn-primary bg-emerald-600 text-sm py-2 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Mark Ready</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========== INVENTORY ========== */}
      {activeTab === 'inventory' && (
        <div className="space-y-4 pb-24 lg:pb-4">
          <div className="flex items-center justify-between animate-fade-in">
            <h2 className="text-xl font-display font-bold text-white">Inventory ({myProducts.length})</h2>
            <button onClick={() => { closeForm(); setShowAddProduct(true); }} className="btn-primary bg-orange-600 text-sm py-2.5 flex items-center gap-2"><Plus className="w-4 h-4" /> Add Product</button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {myProducts.map((p, i) => (
              <div key={p.id} className="bg-surface-800/50 border border-white/5 rounded-2xl p-4 flex items-center gap-4 card-hover animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="w-14 h-14 bg-gradient-to-br from-surface-800 to-surface-900 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">{p.image}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm truncate">{p.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-orange-400">{formatCurrency(p.price)}/{p.unit}</span>
                    <span className="text-xs text-slate-500">• {p.stock} in stock</span>
                  </div>
                  <ProgressBar value={p.stock} max={50} color={p.stock <= 5 ? '#EF4444' : '#EA580C'} height={3} />
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => openEdit(p)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => { dispatch({ type: 'DELETE_PRODUCT', id: p.id }); showToast('Product deleted'); }} className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/5 transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== ANALYTICS ========== */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 pb-24 lg:pb-4">
          <h2 className="text-xl font-display font-bold text-white animate-fade-in">Analytics</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MiniStat label="Revenue" value={formatCurrency(totalRevenue)} icon={<DollarSign className="w-4 h-4" />} color="#10B981" trend="+18%" trendUp delay={0} />
            <MiniStat label="Orders" value={`${myOrders.length}`} icon={<ShoppingBag className="w-4 h-4" />} color="#EA580C" delay={80} />
            <MiniStat label="Products" value={`${myProducts.length}`} icon={<Package className="w-4 h-4" />} color="#3B82F6" delay={160} />
            <MiniStat label="Avg Rating" value={merchant.rating?.toFixed(1) || '–'} icon={<Star className="w-4 h-4" />} color="#F59E0B" delay={240} />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Sales by Category */}
            <div className="bg-surface-800/50 border border-white/5 rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <h3 className="font-semibold text-white mb-4">Sales by Category</h3>
              <BarChart data={categoryData.length > 0 ? categoryData : [{ label: 'N/A', value: 0 }]} height={120} color="#EA580C" />
            </div>
            {/* Order Status Donut */}
            <div className="bg-surface-800/50 border border-white/5 rounded-2xl p-5 animate-fade-in-up flex flex-col items-center" style={{ animationDelay: '400ms' }}>
              <h3 className="font-semibold text-white mb-4 self-start">Order Status</h3>
              <DonutChart segments={donutSegments} size={130} strokeWidth={16}>
                <span className="text-2xl font-bold text-white">{myOrders.length}</span>
                <span className="text-[10px] text-slate-500">total</span>
              </DonutChart>
              <div className="flex gap-4 mt-4">
                {donutSegments.filter((s) => s.value > 0).map((s) => (
                  <div key={s.label} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-xs text-slate-400">{s.label} ({s.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-surface-800/50 border border-white/5 rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <h3 className="font-semibold text-white mb-4">Top Products</h3>
            {myProducts.sort((a, b) => b.sales - a.sales).slice(0, 5).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0 animate-fade-in-up" style={{ animationDelay: `${(i + 6) * 60}ms` }}>
                <span className="text-xs text-slate-500 w-4 font-mono">{i + 1}</span>
                <span className="text-xl">{p.image}</span>
                <div className="flex-1"><div className="text-sm text-white">{p.name}</div><div className="text-xs text-slate-500">{p.sales} sold</div></div>
                <span className="text-sm font-bold text-white">{formatCurrency(p.price * p.sales)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== REVIEWS ========== */}
      {activeTab === 'reviews' && (
        <div className="space-y-4 pb-24 lg:pb-4">
          <h2 className="text-xl font-display font-bold text-white">Reviews ({myReviews.length})</h2>
          {myReviews.length === 0 ? <div className="text-center py-20 animate-fade-in"><span className="text-6xl mb-4 block animate-float">⭐</span><p className="text-slate-400">No reviews yet</p></div> : (
            myReviews.map((r, i) => (
              <div key={r.id} className="bg-surface-800/50 border border-white/5 rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white text-sm">{r.customerName}</span>
                  <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className={cn('w-3.5 h-3.5', j < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700')} />)}</div>
                </div>
                <p className="text-sm text-slate-400">{r.comment}</p>
                <p className="text-xs text-slate-600 mt-2">{formatDate(r.date)}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========== PROFILE ========== */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl mx-auto space-y-6 pb-24 lg:pb-4 animate-fade-in">
          <div className="text-center bg-gradient-to-br from-orange-600/10 to-surface-800/30 border border-white/5 rounded-3xl p-8">
            <div className="w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse-glow"><span className="text-3xl font-bold text-orange-400">{merchant.name.charAt(0)}</span></div>
            <h2 className="text-xl font-bold text-white">{merchant.name}</h2>
            <p className="text-sm text-slate-400">{merchant.email}</p>
            <p className="text-sm text-slate-500 mt-2">{merchant.description}</p>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && <div className="max-w-2xl mx-auto pb-24 lg:pb-4"><h2 className="text-xl font-display font-bold text-white mb-4">Notifications</h2><p className="text-slate-400 text-center py-12">No notifications</p></div>}

      {/* ========== ADD/EDIT PRODUCT MODAL ========== */}
      <Modal open={showAddProduct} onClose={closeForm} title={editProduct ? 'Edit Product' : 'Add Product'}>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Product Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Organic Apples"
              className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white focus:outline-none focus:border-orange-500/30 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-slate-500 mb-1 block">Price ($)</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white focus:outline-none focus:border-orange-500/30" /></div>
            <div><label className="text-xs text-slate-500 mb-1 block">Stock</label><input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="50" className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white focus:outline-none focus:border-orange-500/30" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-slate-500 mb-1 block">Unit</label><select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white">{['lb','oz','each','doz','bunch','pint','loaf'].map((u) => <option key={u} value={u}>{u}</option>)}</select></div>
            <div><label className="text-xs text-slate-500 mb-1 block">Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white">{['Fruits','Vegetables','Dairy','Bakery','Meat','Beverages'].map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
          </div>
          <div><label className="text-xs text-slate-500 mb-1 block">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your product..." className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white focus:outline-none focus:border-orange-500/30 resize-none h-20" /></div>
          <button onClick={handleSave} className="w-full btn-primary bg-orange-600">{editProduct ? 'Update Product' : 'Add Product'}</button>
        </div>
      </Modal>
    </AppShell>
  );
}
