'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/app-store';
import { AppShell } from '@/components/ui/app-shell';
import { Modal } from '@/components/ui/modal';
import { ProgressBar } from '@/components/ui/charts';
import {
  EditProfileModal, LoyaltyModal, AddressModal, PaymentModal,
  DietaryModal,
} from '@/components/customer/profile-modals';
import { SettingsSection } from '@/components/ui/shared-settings';
import { CheckoutModal } from '@/components/ui/payment-system';
import { cn, formatCurrency, getStatusColor, formatDate, formatRelativeTime } from '@/lib/utils';
import { Product, OrderItem } from '@/lib/store';
import {
  Home, ShoppingCart, Package, User, Heart, Search, Plus, Minus,
  Star, X, Leaf, Wheat, Clock, MapPin, Tag, ChevronRight,
  Sparkles, Gift, Truck, Check, ShoppingBag, ArrowRight,
  CreditCard, Settings, LogOut, Bell, Shield, Mail, Phone,
  Copy, Share2, Pencil, BadgePercent, Crown, Award, TrendingUp,
  HelpCircle, FileText, Landmark, Eye, EyeOff, ChevronDown,
} from 'lucide-react';

const navItems = [
  { id: 'shop', label: 'Shop', icon: <Home className="w-5 h-5" /> },
  { id: 'cart', label: 'Cart', icon: <ShoppingCart className="w-5 h-5" /> },
  { id: 'orders', label: 'Orders', icon: <Package className="w-5 h-5" /> },
  { id: 'favorites', label: 'Saved', icon: <Heart className="w-5 h-5" /> },
  { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
];
const categories = ['All', 'Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Meat', 'Beverages'];
const categoryEmoji: Record<string, string> = { All: '🌿', Fruits: '🍎', Vegetables: '🥕', Dairy: '🥛', Bakery: '🍞', Meat: '🥩', Beverages: '🧃' };

export function CustomerApp() {
  const { db, dispatch, showToast, currentUserId } = useAppStore();
  const [activeTab, setActiveTab] = useState('shop');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<(OrderItem & { farmerId: string })[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartBounce, setCartBounce] = useState(false);

  // Profile modal states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showLoyalty, setShowLoyalty] = useState(false);
  const [showAddress, setShowAddress] = useState<'add' | 'edit' | null>(null);
  const [showPayment, setShowPayment] = useState<'add' | 'visa' | 'apple' | null>(null);
  const [showDietary, setShowDietary] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [reviewingOrder, setReviewingOrder] = useState<string | null>(null);
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  const currentUser = db.users.find((u) => u.id === currentUserId);
  const products = db.products.filter((p) => p.status === 'active');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) return prev.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1, image: product.image, farmerId: product.farmerId }];
    });
    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 400);
    showToast(`${product.name} added to cart`);
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => prev.map((item) => item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item).filter((item) => item.qty > 0));
  };

  const placeOrder = (tip = 0, promoCode = '') => {
    if (cart.length === 0 || !currentUserId) return;
    const merchantId = cart[0].farmerId;
    const promo = promoCode ? db.promos.find((p) => p.code.toUpperCase() === promoCode.toUpperCase()) : null;
    const promoDiscount = promo ? (promo.type === 'percent' ? cartTotal * (promo.discount / 100) : promo.type === 'flat' ? promo.discount : db.settings.deliveryBaseFee) : 0;
    const fees = { subtotal: cartTotal, delivery: db.settings.deliveryBaseFee, platform: cartTotal * (db.settings.platformFeePercent / 100), tax: cartTotal * db.settings.taxRate, tip, discount: Math.min(promoDiscount, cartTotal) };
    const total = fees.subtotal + fees.delivery + fees.platform + fees.tax + fees.tip - fees.discount;
    dispatch({ type: 'CREATE_ORDER', payload: { customerId: currentUserId, merchantId, items: cart.map(({ farmerId, ...item }) => item), fees, total } });
    if (promo) dispatch({ type: 'USE_PROMO', code: promoCode });
    setCart([]);
    setActiveTab('orders');
  };

  const myOrders = db.orders.filter((o) => o.customerId === currentUserId);
  const statusSteps = ['Pending', 'Processing', 'Ready', 'Picked Up', 'Delivered'];

  return (
    <AppShell role="customer" navItems={navItems} activeTab={activeTab} onTabChange={setActiveTab}>
      {/* ========== SHOP TAB ========== */}
      {activeTab === 'shop' && (
        <div className="space-y-6 pb-24 lg:pb-4">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600/20 via-emerald-800/10 to-surface-900 border border-emerald-500/10 p-6 animate-fade-in">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <p className="text-sm text-emerald-400 font-medium">
                  Welcome back{currentUser ? `, ${currentUser.name.split(' ')[0]}` : ''}
                </p>
              </div>
              <h2 className="text-2xl font-display font-bold text-white mb-1">Fresh from the farm</h2>
              <p className="text-sm text-slate-400">{products.length} products • {db.users.filter((u) => u.role === 'farmer').length} local farms</p>
              {currentUser?.loyaltyTier && (
                <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  <Gift className="w-3 h-3 text-amber-400" />
                  <span className="text-xs text-amber-400 font-semibold">{currentUser.loyaltyTier} Member</span>
                </div>
              )}
            </div>
            <div className="absolute right-4 top-2 text-7xl opacity-10 animate-float">🌿</div>
          </div>

          {/* Search */}
          <div className="relative input-glow rounded-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-surface-800 border border-white/5 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/30 transition-all" />
          </div>

          {/* Categories with emoji */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={cn('flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300', selectedCategory === cat ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-105' : 'bg-surface-800 text-slate-400 hover:bg-surface-800/80 border border-white/5')}>
                <span className="text-sm">{categoryEmoji[cat] || '🌱'}</span>{cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
            {filteredProducts.map((product, i) => {
              const inCart = cart.find((c) => c.id === product.id);
              return (
                <div key={product.id}
                  className="group bg-surface-800/50 border border-white/5 rounded-2xl overflow-hidden hover:border-emerald-500/20 transition-all duration-300 card-hover animate-fade-in-up"
                  style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}>
                  {/* Image */}
                  <div className="relative aspect-square flex items-center justify-center bg-gradient-to-br from-surface-800 to-surface-900 cursor-pointer overflow-hidden"
                    onClick={() => setSelectedProduct(product)}>
                    {product.image.startsWith('data:') ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover product-img" />
                    ) : (
                      <span className="text-6xl product-img">{product.image}</span>
                    )}
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {product.organic && (
                        <span className="tag-pill bg-emerald-500/20 text-emerald-400 border border-emerald-500/10">
                          <Leaf className="w-2.5 h-2.5" /> Organic
                        </span>
                      )}
                    </div>
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-sm font-semibold text-red-400 bg-red-500/10 px-3 py-1 rounded-full">Sold Out</span>
                      </div>
                    )}
                    {product.stock > 0 && product.stock <= 5 && (
                      <span className="absolute top-2 right-2 badge bg-amber-500/20 text-amber-400 animate-pulse">{product.stock} left</span>
                    )}
                    {product.stock === 0 || product.stock > 5 ? (
                      <button onClick={(e) => { e.stopPropagation(); currentUserId && dispatch({ type: 'TOGGLE_FAVORITE', userId: currentUserId, productId: product.id }); }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-surface-900/80 backdrop-blur-sm flex items-center justify-center hover:bg-surface-900 transition-all active:scale-90">
                        <Heart className={cn('w-4 h-4', (currentUser?.favorites || []).includes(product.id) ? 'text-red-400 fill-red-400' : 'text-slate-400')} />
                      </button>
                    ) : null}
                    {/* Quick add overlay */}
                    {product.stock > 0 && !inCart && (
                      <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                          className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-medium text-sm shadow-lg shadow-emerald-500/20 scale-90 group-hover:scale-100 transition-all">
                          <Plus className="w-4 h-4 inline mr-1" /> Add
                        </button>
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-white truncate">{product.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-slate-400">{product.rating} ({product.reviews})</span>
                    </div>
                    <div className="flex items-center justify-between mt-2.5">
                      <div>
                        <span className="text-lg font-bold text-white">{formatCurrency(product.price)}</span>
                        <span className="text-xs text-slate-500 ml-0.5">/{product.unit}</span>
                      </div>
                      {product.stock > 0 && inCart && (
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => updateQty(product.id, -1)} className="w-7 h-7 rounded-lg bg-surface-900 flex items-center justify-center text-slate-400 hover:text-white transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                          <span className="text-sm font-bold text-emerald-400 w-5 text-center">{inCart.qty}</span>
                          <button onClick={() => updateQty(product.id, 1)} className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-400 transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                        </div>
                      )}
                      {product.stock > 0 && !inCart && (
                        <button onClick={() => addToCart(product)} className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-all ripple">
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-16 animate-fade-in"><span className="text-5xl mb-4 block animate-float">🔍</span><p className="text-slate-400">No products found</p></div>
          )}
        </div>
      )}

      {/* ========== CART TAB ========== */}
      {activeTab === 'cart' && (
        <div className="max-w-2xl mx-auto space-y-4 pb-24 lg:pb-4">
          <h2 className="text-xl font-display font-bold text-white animate-fade-in">Your Cart ({cartCount})</h2>
          {cart.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <span className="text-6xl mb-4 block animate-float">🛒</span>
              <p className="text-slate-400 mb-4">Your cart is empty</p>
              <button onClick={() => setActiveTab('shop')} className="btn-primary bg-emerald-600">Start Shopping</button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {cart.map((item, i) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-surface-800/50 border border-white/5 rounded-2xl animate-fade-in-up hover:border-white/10 transition-all" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="w-14 h-14 bg-gradient-to-br from-surface-800 to-surface-900 rounded-xl flex items-center justify-center text-2xl overflow-hidden">
                      {item.image.startsWith('data:') ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : item.image}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm truncate">{item.name}</h3>
                      <p className="text-emerald-400 font-bold text-sm">{formatCurrency(item.price * item.qty)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 rounded-lg bg-surface-900 flex items-center justify-center text-slate-400 hover:text-white transition-colors"><Minus className="w-4 h-4" /></button>
                      <span className="text-sm font-bold text-white w-6 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Summary */}
              <div className="bg-surface-800/50 border border-white/5 rounded-2xl p-5 space-y-3 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <h3 className="font-semibold text-white">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  {[
                    ['Subtotal', formatCurrency(cartTotal)],
                    ['Delivery', formatCurrency(db.settings.deliveryBaseFee)],
                    [`Tax (${(db.settings.taxRate * 100).toFixed(0)}%)`, formatCurrency(cartTotal * db.settings.taxRate)],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between text-slate-400"><span>{l}</span><span>{v}</span></div>
                  ))}
                  <div className="border-t border-white/5 pt-3 flex justify-between text-white font-bold text-base">
                    <span>Total</span>
                    <span className="text-emerald-400">{formatCurrency(cartTotal + db.settings.deliveryBaseFee + cartTotal * db.settings.taxRate + cartTotal * (db.settings.platformFeePercent / 100))}</span>
                  </div>
                </div>
                <button onClick={() => setShowCheckout(true)} className="w-full btn-primary bg-emerald-600 flex items-center justify-center gap-2 mt-2">
                  <ShoppingBag className="w-4 h-4" /> Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========== ORDERS TAB ========== */}
      {activeTab === 'orders' && (
        <div className="max-w-2xl mx-auto space-y-4 pb-24 lg:pb-4">
          <h2 className="text-xl font-display font-bold text-white">Your Orders ({myOrders.length})</h2>
          {myOrders.length === 0 ? (
            <div className="text-center py-20 animate-fade-in"><span className="text-6xl mb-4 block animate-float">📦</span><p className="text-slate-400">No orders yet</p></div>
          ) : (
            <div className="space-y-3">
              {myOrders.map((order, i) => {
                const stepIdx = statusSteps.indexOf(order.status);
                return (
                  <div key={order.id} onClick={() => setSelectedOrder(order.id)}
                    className="bg-surface-800/50 border border-white/5 rounded-2xl p-5 animate-fade-in-up hover:border-white/10 transition-all cursor-pointer active:scale-[0.99]" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-xs text-slate-500 font-mono">#{order.id.slice(-6).toUpperCase()}</span>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" />{formatRelativeTime(order.date)}</div>
                      </div>
                      <span className={cn('badge', getStatusColor(order.status))}>{order.status}</span>
                    </div>
                    {order.status !== 'Cancelled' && (
                      <div className="flex items-center gap-1 mb-4">
                        {statusSteps.map((step, si) => (
                          <div key={step} className="flex-1"><div className={cn('w-full h-1.5 rounded-full', si <= stepIdx ? 'bg-emerald-500' : 'bg-white/5')} /></div>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 px-3 py-1.5 bg-surface-900 rounded-lg">
                          {item.image?.startsWith?.('data:') ? <img src={item.image} alt="" className="w-5 h-5 rounded object-cover" /> : <span>{item.image}</span>}
                          <span className="text-xs text-slate-300">{item.name} × {item.qty}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-white">{formatCurrency(order.total)}</span>
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========== ORDER DETAIL MODAL ========== */}
      {(() => {
        const od = myOrders.find((o) => o.id === selectedOrder);
        if (!od) return null;
        const merchant = db.users.find((u) => u.id === od.merchantId);
        const stepIdx = statusSteps.indexOf(od.status);
        return (
          <Modal open={true} onClose={() => setSelectedOrder(null)} title={`Order #${od.id.slice(-6).toUpperCase()}`}>
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className={cn('badge text-sm', getStatusColor(od.status))}>{od.status}</span>
                <span className="text-xs text-slate-500">{formatDate(od.date)}</span>
              </div>
              {od.status !== 'Cancelled' && (
                <div>
                  <div className="flex items-center gap-1 mb-1.5">
                    {statusSteps.map((s, si) => (
                      <div key={s} className="flex-1"><div className={cn('h-2 rounded-full', si <= stepIdx ? 'bg-emerald-500' : 'bg-white/5')} /></div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-600">
                    {statusSteps.map((s) => <span key={s}>{s}</span>)}
                  </div>
                </div>
              )}
              {merchant && (
                <div className="bg-surface-800 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center"><span className="text-lg">🌾</span></div>
                  <div>
                    <div className="text-sm font-medium text-white">{merchant.businessName || merchant.name}</div>
                    <div className="text-xs text-slate-500">Farmer American Hero</div>
                  </div>
                </div>
              )}
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Items ({od.items.length})</div>
                {od.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
                    <div className="w-10 h-10 bg-surface-800 rounded-lg flex items-center justify-center overflow-hidden">
                      {item.image?.startsWith?.('data:') ? <img src={item.image} className="w-full h-full object-cover" /> : <span className="text-lg">{item.image}</span>}
                    </div>
                    <div className="flex-1"><div className="text-sm text-white">{item.name}</div><div className="text-xs text-slate-500">Qty: {item.qty} × {formatCurrency(item.price)}</div></div>
                    <span className="text-sm font-bold text-white">{formatCurrency(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="bg-surface-800 rounded-xl p-4 space-y-2">
                {[
                  ['Subtotal', od.fees.subtotal],
                  ['Delivery', od.fees.delivery],
                  ['Service Fee', od.fees.platform],
                  ['Tax', od.fees.tax],
                  ...(od.fees.tip > 0 ? [['Tip', od.fees.tip]] : []),
                  ...(od.fees.discount > 0 ? [['Discount', -od.fees.discount]] : []),
                ].map(([l, v]) => (
                  <div key={l as string} className="flex justify-between text-xs">
                    <span className="text-slate-400">{l}</span>
                    <span className={cn('font-mono', (v as number) < 0 ? 'text-emerald-400' : 'text-white')}>{(v as number) < 0 ? '-' : ''}{formatCurrency(Math.abs(v as number))}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-white/5">
                  <span className="font-semibold text-white">Total</span>
                  <span className="font-bold text-emerald-400">{formatCurrency(od.total)}</span>
                </div>
              </div>
              {currentUser?.address && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <MapPin className="w-3 h-3" /> Delivery to: {currentUser.address.street}, {currentUser.address.city}
                </div>
              )}
              {(od.status === 'Pending' || od.status === 'Processing') && (
                <button onClick={(e) => { e.stopPropagation(); dispatch({ type: 'CANCEL_ORDER', orderId: od.id, customerId: currentUserId!, reason: 'Cancelled by customer' }); showToast('Order cancelled'); setSelectedOrder(null); }}
                  className="w-full py-3 rounded-2xl border border-red-500/20 text-red-400 text-sm hover:bg-red-500/5 transition-all">Cancel Order</button>
              )}
              {od.status === 'Delivered' && (
                <button onClick={() => { setReviewingOrder(od.id); setSelectedOrder(null); setReviewStars(5); setReviewText(''); }}
                  className="w-full btn-primary bg-emerald-600 text-sm flex items-center justify-center gap-2">
                  <Star className="w-4 h-4" /> Rate this Order
                </button>
              )}
            </div>
          </Modal>
        );
      })()}

      {/* ========== REVIEW ORDER MODAL ========== */}
      {(() => {
        const ro = myOrders.find((o) => o.id === reviewingOrder);
        if (!ro) return null;
        const submitReview = () => {
          ro.items.forEach((item) => {
            dispatch({ type: 'ADD_REVIEW', payload: { productId: item.id, customerId: currentUserId!, customerName: currentUser?.name || 'Customer', rating: reviewStars, comment: reviewText || 'Great product!' } });
          });
          showToast('Review submitted! Thank you! ⭐');
          setReviewingOrder(null);
        };
        return (
          <Modal open={true} onClose={() => setReviewingOrder(null)} title="Rate Your Order">
            <div className="p-6 space-y-5">
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-4">How was your order from <span className="text-white font-semibold">{db.users.find((u) => u.id === ro.merchantId)?.businessName || 'the farm'}</span>?</p>
                {/* Star Rating */}
                <div className="flex justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setReviewStars(s)} className="p-1 transition-transform hover:scale-110 active:scale-95">
                      <Star className={cn('w-9 h-9 transition-colors', s <= reviewStars ? 'text-amber-400 fill-amber-400' : 'text-slate-700')} />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-slate-500">{reviewStars === 5 ? 'Excellent!' : reviewStars === 4 ? 'Great!' : reviewStars === 3 ? 'Good' : reviewStars === 2 ? 'Fair' : 'Poor'}</p>
              </div>

              {/* Items reviewed */}
              <div className="flex flex-wrap gap-2">
                {ro.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 px-3 py-2 bg-surface-800 rounded-xl">
                    {item.image?.startsWith?.('data:') ? <img src={item.image} className="w-6 h-6 rounded object-cover" /> : <span className="text-sm">{item.image}</span>}
                    <span className="text-xs text-slate-300">{item.name}</span>
                  </div>
                ))}
              </div>

              {/* Review text */}
              <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)}
                placeholder="Tell us about your experience... (optional)"
                className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white text-sm resize-none h-24 focus:outline-none focus:border-emerald-500/30 placeholder-slate-600" />

              <button onClick={submitReview} className="w-full btn-primary bg-emerald-600 text-sm flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Submit Review
              </button>
            </div>
          </Modal>
        );
      })()}

      {/* ========== FAVORITES TAB ========== */}
      {activeTab === 'favorites' && (
        <div className="max-w-2xl mx-auto space-y-4 pb-24 lg:pb-4">
          <h2 className="text-xl font-display font-bold text-white">Saved Items</h2>
          {(() => {
            const favProducts = products.filter((p) => (currentUser?.favorites || []).includes(p.id));
            if (favProducts.length === 0) return <div className="text-center py-20 animate-fade-in"><span className="text-6xl mb-4 block animate-float">💚</span><p className="text-slate-400">No saved items yet</p></div>;
            return (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {favProducts.map((p, i) => (
                  <div key={p.id} onClick={() => setSelectedProduct(p)} className="bg-surface-800/50 border border-white/5 rounded-2xl p-4 text-center card-hover animate-fade-in-up cursor-pointer" style={{ animationDelay: `${i * 60}ms` }}>
                    {p.image.startsWith('data:') ? (
                      <img src={p.image} alt={p.name} className="w-16 h-16 rounded-xl object-cover mx-auto mb-2" />
                    ) : (
                      <span className="text-4xl block mb-2">{p.image}</span>
                    )}
                    <h3 className="text-sm font-semibold text-white truncate">{p.name}</h3>
                    <p className="text-emerald-400 font-bold mt-1">{formatCurrency(p.price)}</p>
                    <button onClick={(e) => { e.stopPropagation(); addToCart(p); }} className="w-full mt-3 py-2 text-xs font-medium rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">Add to Cart</button>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* ========== PROFILE TAB ========== */}
      {activeTab === 'profile' && currentUser && (
        <div className="max-w-2xl mx-auto space-y-4 pb-24 lg:pb-4">
          {/* Avatar + Hero Card */}
          <div className="relative bg-gradient-to-br from-emerald-600/10 via-emerald-800/5 to-surface-800/30 border border-white/5 rounded-3xl p-6 animate-fade-in overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/[0.04] rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center animate-pulse-glow flex-shrink-0">
                  <span className="text-2xl font-bold text-emerald-400">{currentUser.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white truncate">{currentUser.name}</h2>
                  <p className="text-xs text-slate-400">{currentUser.email}</p>
                  {currentUser.phone && <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" />{currentUser.phone}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="badge bg-amber-500/15 text-amber-400 flex items-center gap-1"><Crown className="w-3 h-3" />{currentUser.loyaltyTier || 'Bronze'}</span>
                    <span className="badge bg-emerald-500/15 text-emerald-400"><Shield className="w-3 h-3 inline mr-0.5" />Verified</span>
                  </div>
                </div>
                <button onClick={() => setShowEditProfile(true)} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"><Pencil className="w-4 h-4" /></button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-2 mt-5">
                {[
                  { value: `${currentUser.points || 0}`, label: 'Points', color: 'text-emerald-400' },
                  { value: formatCurrency(currentUser.credits), label: 'Credits', color: 'text-blue-400' },
                  { value: `${myOrders.length}`, label: 'Orders', color: 'text-orange-400' },
                  { value: formatCurrency(currentUser.totalSpent), label: 'Spent', color: 'text-violet-400' },
                ].map((s, i) => (
                  <div key={s.label} className="bg-surface-900/50 rounded-xl p-2.5 text-center animate-count-up" style={{ animationDelay: `${i * 80 + 150}ms` }}>
                    <div className={cn('text-base font-bold', s.color)}>{s.value}</div>
                    <div className="text-[10px] text-slate-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Loyalty Progress */}
          <button onClick={() => setShowLoyalty(true)} className="w-full text-left card bg-surface-800/50 border border-white/5 rounded-2xl p-4 animate-fade-in-up hover:border-white/10 transition-all active:scale-[0.99]" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-white">Loyalty Progress</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </div>
            <ProgressBar value={currentUser.totalSpent || 0} max={1000} color="#F59E0B" height={8} label={`${formatCurrency(currentUser.totalSpent)} / $1,000`} showValue />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-slate-500">Spend {formatCurrency(1000 - (currentUser.totalSpent || 0))} more to reach Gold</p>
              <div className="flex gap-1">{['Bronze','Silver','Gold'].map((t) => (
                <span key={t} className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded', t === (currentUser.loyaltyTier || 'Bronze') ? 'bg-amber-500/20 text-amber-400' : 'text-slate-600')}>{t}</span>
              ))}</div>
            </div>
          </button>

          {/* Referral Card */}
          <div className="bg-gradient-to-r from-violet-600/10 to-blue-600/10 border border-violet-500/10 rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0"><Share2 className="w-5 h-5 text-violet-400" /></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white">Refer & Earn $5</div>
                <p className="text-xs text-slate-400">Share your code, get $5 credit per friend</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1 bg-surface-900 rounded-xl px-4 py-2.5 flex items-center justify-between">
                <span className="text-sm font-mono font-bold text-violet-400">{currentUser.referralCode || 'GENERATE'}</span>
                <button onClick={() => { navigator.clipboard?.writeText(currentUser.referralCode || '').then(() => showToast('Code copied!')).catch(() => showToast('Code: ' + (currentUser.referralCode || 'N/A'), 'info')); }}
                  className="p-1 text-slate-500 hover:text-white"><Copy className="w-3.5 h-3.5" /></button>
              </div>
              <button onClick={() => { const url = `https://farmfresh-web-pi.vercel.app/?ref=${currentUser.referralCode || ''}`; if (navigator.share) { navigator.share({ title: 'Join FarmFresh Hub!', text: 'Get $5 off your first order of natural, farm-fresh food!', url }).catch(() => {}); } else { navigator.clipboard?.writeText(url).then(() => showToast('Share link copied!')).catch(() => showToast(url, 'info')); } }} className="px-4 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-500 transition-all active:scale-[0.97]">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
            {(currentUser.referralCount || 0) > 0 && (
              <p className="text-xs text-violet-400 mt-2">{currentUser.referralCount} friends referred • {formatCurrency((currentUser.referralCount || 0) * 5)} earned</p>
            )}
          </div>

          {/* Order Summary */}
          <button onClick={() => setActiveTab('orders')} className="w-full text-left card bg-surface-800/50 border border-white/5 rounded-2xl p-4 animate-fade-in-up hover:border-white/10 transition-all active:scale-[0.99]" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-semibold text-white">Order History</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Active', count: myOrders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length, color: '#3B82F6' },
                { label: 'Delivered', count: myOrders.filter((o) => o.status === 'Delivered').length, color: '#10B981' },
                { label: 'Total', count: myOrders.length, color: '#EA580C' },
              ].map((s) => (
                <div key={s.label} className="bg-surface-900 rounded-xl p-2.5 text-center">
                  <div className="text-base font-bold" style={{ color: s.color }}>{s.count}</div>
                  <div className="text-[10px] text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
          </button>

          {/* Saved Addresses */}
          <div className="card bg-surface-800/50 border border-white/5 rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-white">Addresses</span>
              </div>
              <button onClick={() => setShowAddress('add')} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"><Plus className="w-3 h-3" />Add</button>
            </div>
            {currentUser.address ? (
              <button onClick={() => setShowAddress('edit')} className="w-full text-left flex items-center gap-3 bg-surface-900 rounded-xl p-3 hover:bg-surface-900/80 transition-all active:scale-[0.99]">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0"><MapPin className="w-5 h-5 text-emerald-400" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-medium">Home</span>
                    <span className="badge bg-emerald-500/15 text-emerald-400 text-[9px]">Default</span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{currentUser.address.street}, {currentUser.address.city}, {currentUser.address.state} {currentUser.address.zip}</p>
                </div>
                <Pencil className="w-3.5 h-3.5 text-slate-600" />
              </button>
            ) : (
              <button onClick={() => setShowAddress('add')} className="w-full py-4 rounded-xl border border-dashed border-white/10 text-sm text-slate-500 hover:text-white hover:border-emerald-500/30 transition-all">
                <Plus className="w-4 h-4 inline mr-1" /> Add delivery address
              </button>
            )}
          </div>

          {/* Payment Methods */}
          <div className="card bg-surface-800/50 border border-white/5 rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-white">Payment Methods</span>
              </div>
              <button onClick={() => setShowPayment('add')} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus className="w-3 h-3" />Add</button>
            </div>
            <div className="space-y-2">
              {currentUser.cardLast4 ? (
                <button onClick={() => setShowPayment('visa')} className="w-full text-left flex items-center gap-3 bg-surface-900 rounded-xl p-3 hover:bg-surface-900/80 transition-all active:scale-[0.99]">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white font-medium">Card •••• {currentUser.cardLast4}</span>
                      <span className="badge bg-blue-500/15 text-blue-400 text-[9px]">Default</span>
                    </div>
                    <span className="text-xs text-slate-500">Saved payment method</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              ) : (
                <button onClick={() => setShowPayment('add')} className="w-full py-6 rounded-xl border border-dashed border-white/10 text-sm text-slate-500 hover:text-white hover:border-emerald-500/30 transition-all">
                  <CreditCard className="w-5 h-5 inline mr-2 text-slate-600" /> Add a payment method
                </button>
              )}
            </div>
          </div>

          {/* Dietary Preferences */}
          <div className="card bg-surface-800/50 border border-white/5 rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-green-400" />
                <span className="text-sm font-semibold text-white">Dietary Preferences</span>
              </div>
              <button onClick={() => setShowDietary(true)} className="text-xs text-green-400 hover:text-green-300">Edit</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: '🌿 Organic', active: true },
                { label: '🌱 Vegan', active: false },
                { label: '🥜 Nut-Free', active: false },
                { label: '🌾 Gluten-Free', active: true },
                { label: '🥛 Dairy-Free', active: false },
                { label: '🍯 Local Honey', active: true },
              ].map((pref) => (
                <button key={pref.label} onClick={() => setShowDietary(true)}
                  className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-[0.95]',
                    pref.active ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-surface-900 text-slate-500 border border-white/5 hover:border-white/10')}>
                  {pref.label}
                </button>
              ))}
            </div>
          </div>

          {/* Settings, Legal, Privacy, Help, Sign Out */}
          <SettingsSection role="customer" detectedState={currentUser.address?.state || 'FL'} />
        </div>
      )}

      {/* ========== NOTIFICATIONS ========== */}
      {activeTab === 'notifications' && (
        <div className="max-w-2xl mx-auto space-y-4 pb-24 lg:pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-white">Notifications</h2>
            <button onClick={() => currentUserId && dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ', userId: currentUserId })} className="text-xs text-emerald-400 hover:text-emerald-300">Mark all read</button>
          </div>
          {db.notifications.filter((n) => n.userId === currentUserId).length === 0 ? (
            <div className="text-center py-20 animate-fade-in"><span className="text-6xl mb-4 block">🔔</span><p className="text-slate-400">No notifications</p></div>
          ) : (
            db.notifications.filter((n) => n.userId === currentUserId).map((n, i) => (
              <div key={n.id} onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', notificationId: n.id })}
                className={cn('p-4 rounded-2xl border transition-all cursor-pointer animate-fade-in-up', n.read ? 'bg-surface-800/30 border-white/5' : 'bg-surface-800/50 border-emerald-500/10')}
                style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-start gap-3">
                  {!n.read && <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0 animate-pulse" />}
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-white">{n.title}</div>
                    <p className="text-sm text-slate-400 mt-1">{n.message}</p>
                    <p className="text-xs text-slate-600 mt-2">{formatRelativeTime(n.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========== FLOATING CART ========== */}
      {activeTab === 'shop' && cartCount > 0 && (
        <button onClick={() => setActiveTab('cart')}
          className={cn('fixed bottom-20 lg:bottom-8 right-6 bg-emerald-600 text-white px-6 py-3.5 rounded-2xl shadow-lg shadow-emerald-900/30 flex items-center gap-3 hover:bg-emerald-500 transition-all z-30', cartBounce ? 'animate-cart-bounce' : 'animate-scale-up')}>
          <ShoppingCart className="w-5 h-5" />
          <span className="font-semibold">{cartCount} items</span>
          <div className="w-px h-5 bg-white/20" />
          <span className="font-bold">{formatCurrency(cartTotal)}</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      )}

      {/* ========== PRODUCT DETAIL MODAL ========== */}
      <Modal open={!!selectedProduct} onClose={() => setSelectedProduct(null)} title={selectedProduct?.name}>
        {selectedProduct && (
          <div>
            <div className="aspect-[4/3] bg-gradient-to-br from-surface-800 to-surface-900 flex items-center justify-center">
              {selectedProduct.image.startsWith('data:') ? (
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover animate-scale-in" />
              ) : (
                <span className="text-[100px] animate-emoji-pop">{selectedProduct.image}</span>
              )}
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-400">{selectedProduct.description}</p>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-white">{formatCurrency(selectedProduct.price)}</span>
                <span className="text-slate-500">/{selectedProduct.unit}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedProduct.organic && <span className="tag-pill bg-emerald-500/15 text-emerald-400 border border-emerald-500/10"><Leaf className="w-3 h-3" /> Organic</span>}
                {selectedProduct.vegan && <span className="tag-pill bg-green-500/15 text-green-400 border border-green-500/10">🌱 Vegan</span>}
                {selectedProduct.glutenFree && <span className="tag-pill bg-amber-500/15 text-amber-400 border border-amber-500/10"><Wheat className="w-3 h-3" /> Gluten-Free</span>}
              </div>
              <div className="flex items-center gap-3 p-3 bg-surface-800 rounded-xl">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="font-semibold text-white text-lg">{selectedProduct.rating}</span>
                <span className="text-slate-500">({selectedProduct.reviews} reviews)</span>
                <div className="flex-1" />
                <span className="text-xs text-slate-500">{selectedProduct.stock} in stock</span>
              </div>
              <button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }} disabled={selectedProduct.stock === 0}
                className="w-full btn-primary bg-emerald-600 disabled:bg-slate-700 flex items-center justify-center gap-2">
                {selectedProduct.stock === 0 ? 'Out of Stock' : <><Plus className="w-4 h-4" /> Add to Cart</>}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========== CONSUMER-SPECIFIC PROFILE MODALS ========== */}
      <EditProfileModal open={showEditProfile} onClose={() => setShowEditProfile(false)} />
      <LoyaltyModal open={showLoyalty} onClose={() => setShowLoyalty(false)} />
      <AddressModal open={!!showAddress} onClose={() => setShowAddress(null)} editMode={showAddress === 'edit'} />
      <PaymentModal open={!!showPayment} onClose={() => setShowPayment(null)} mode={showPayment || 'add'} />
      <DietaryModal open={showDietary} onClose={() => setShowDietary(false)} />
      <CheckoutModal open={showCheckout} onClose={() => setShowCheckout(false)} cart={cart} cartTotal={cartTotal} onPlaceOrder={(tip, promo) => { placeOrder(tip, promo); setShowCheckout(false); }} />
    </AppShell>
  );
}
