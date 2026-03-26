'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/app-store';
import { AppShell } from '@/components/ui/app-shell';
import { Modal } from '@/components/ui/modal';
import { ProgressBar } from '@/components/ui/charts';
import { cn, formatCurrency, getStatusColor, formatDate, formatRelativeTime } from '@/lib/utils';
import { Product, OrderItem } from '@/lib/store';
import {
  Home, ShoppingCart, Package, User, Heart, Search, Plus, Minus,
  Star, X, Leaf, Wheat, Clock, MapPin, Tag, ChevronRight,
  Sparkles, Gift, Truck, Check, ShoppingBag, ArrowRight,
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

  const placeOrder = () => {
    if (cart.length === 0 || !currentUserId) return;
    const merchantId = cart[0].farmerId;
    const fees = { subtotal: cartTotal, delivery: db.settings.deliveryBaseFee, platform: cartTotal * (db.settings.platformFeePercent / 100), tax: cartTotal * db.settings.taxRate, tip: 0, discount: 0 };
    dispatch({ type: 'CREATE_ORDER', payload: { customerId: currentUserId, merchantId, items: cart.map(({ farmerId, ...item }) => item), fees, total: fees.subtotal + fees.delivery + fees.platform + fees.tax } });
    setCart([]);
    setActiveTab('orders');
    showToast('Order placed successfully!');
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
                    <span className="text-6xl product-img">{product.image}</span>
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
                    <div className="w-14 h-14 bg-gradient-to-br from-surface-800 to-surface-900 rounded-xl flex items-center justify-center text-2xl">{item.image}</div>
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
                <button onClick={placeOrder} className="w-full btn-primary bg-emerald-600 flex items-center justify-center gap-2 mt-2">
                  <ShoppingBag className="w-4 h-4" /> Place Order
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
                  <div key={order.id} className="bg-surface-800/50 border border-white/5 rounded-2xl p-5 animate-fade-in-up hover:border-white/10 transition-all" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-xs text-slate-500 font-mono">#{order.id.slice(-6).toUpperCase()}</span>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" />{formatRelativeTime(order.date)}</div>
                      </div>
                      <span className={cn('badge', getStatusColor(order.status))}>{order.status}</span>
                    </div>
                    {/* Progress tracker */}
                    {order.status !== 'Cancelled' && (
                      <div className="flex items-center gap-1 mb-4">
                        {statusSteps.map((step, si) => (
                          <div key={step} className="flex-1 flex items-center">
                            <div className={cn('w-full h-1.5 rounded-full transition-all duration-500', si <= stepIdx ? 'bg-emerald-500' : 'bg-white/5')}
                              style={si <= stepIdx ? { animationDelay: `${si * 150}ms` } : {}} />
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Items */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 px-3 py-1.5 bg-surface-900 rounded-lg">
                          <span>{item.image}</span>
                          <span className="text-xs text-slate-300">{item.name} × {item.qty}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-white">{formatCurrency(order.total)}</span>
                      {(order.status === 'Pending' || order.status === 'Processing') && (
                        <button onClick={() => { dispatch({ type: 'CANCEL_ORDER', orderId: order.id, customerId: currentUserId!, reason: 'Cancelled by customer' }); showToast('Order cancelled'); }}
                          className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/5 transition-all">Cancel</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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
                  <div key={p.id} className="bg-surface-800/50 border border-white/5 rounded-2xl p-4 text-center card-hover animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                    <span className="text-4xl block mb-2">{p.image}</span>
                    <h3 className="text-sm font-semibold text-white truncate">{p.name}</h3>
                    <p className="text-emerald-400 font-bold mt-1">{formatCurrency(p.price)}</p>
                    <button onClick={() => addToCart(p)} className="w-full mt-3 py-2 text-xs font-medium rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">Add to Cart</button>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* ========== PROFILE TAB ========== */}
      {activeTab === 'profile' && currentUser && (
        <div className="max-w-2xl mx-auto space-y-6 pb-24 lg:pb-4">
          <div className="text-center bg-gradient-to-br from-emerald-600/10 to-surface-800/30 border border-white/5 rounded-3xl p-8 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
              <span className="text-3xl font-bold text-emerald-400">{currentUser.name.charAt(0)}</span>
            </div>
            <h2 className="text-xl font-bold text-white">{currentUser.name}</h2>
            <p className="text-sm text-slate-400">{currentUser.email}</p>
            <div className="flex items-center justify-center gap-8 mt-6">
              {[
                { value: `${currentUser.points || 0}`, label: 'Points', color: 'text-emerald-400' },
                { value: formatCurrency(currentUser.credits), label: 'Credits', color: 'text-blue-400' },
                { value: currentUser.loyaltyTier || 'Bronze', label: 'Tier', color: 'text-amber-400' },
              ].map((s, i) => (
                <div key={s.label} className="animate-count-up" style={{ animationDelay: `${i * 100 + 200}ms` }}>
                  <div className={cn('text-xl font-bold', s.color)}>{s.value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Loyalty progress */}
          <div className="bg-surface-800/50 border border-white/5 rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-2 mb-3">
              <Gift className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-white">Loyalty Progress</span>
            </div>
            <ProgressBar value={currentUser.totalSpent || 0} max={1000} color="#F59E0B" height={8} label={`${formatCurrency(currentUser.totalSpent)} spent`} showValue />
            <p className="text-xs text-slate-500 mt-2">Spend {formatCurrency(1000 - (currentUser.totalSpent || 0))} more to reach Gold</p>
          </div>
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
              <span className="text-[100px] animate-emoji-pop">{selectedProduct.image}</span>
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
    </AppShell>
  );
}
