'use client';

import { useAppStore } from '@/lib/app-store';
import { cn, getRoleColor } from '@/lib/utils';
import {
  Menu,
  X,
  ArrowLeft,
  Bell,
  Home,
  ShoppingCart,
  Package,
  User,
  Heart,
  Truck,
  DollarSign,
  Map,
  BarChart3,
  Store,
  ClipboardList,
  Settings,
  Users,
  Gauge,
  Database,
  Shield,
  LogOut,
} from 'lucide-react';
import React, { useState } from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface AppShellProps {
  role: 'customer' | 'driver' | 'farmer' | 'owner';
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
  title?: string;
}

export function AppShell({
  role,
  navItems,
  activeTab,
  onTabChange,
  children,
  title,
}: AppShellProps) {
  const { setRole, db, currentUserId } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const accentColor = getRoleColor(role);
  const currentUser = db.users.find((u) => u.id === currentUserId);
  const unreadNotifications = db.notifications.filter(
    (n) => n.userId === currentUserId && !n.read
  ).length;

  return (
    <div className="min-h-dvh bg-surface-950 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-surface-900 border-r border-white/5 fixed h-full z-30">
        {/* Brand */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: accentColor + '20' }}
            >
              <span className="text-xl">🥬</span>
            </div>
            <div>
              <div className="font-display font-bold text-white text-lg leading-tight">
                EdemFarm
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">
                {role === 'owner' ? 'Admin Panel' : `${role} Portal`}
              </div>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                activeTab === item.id
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              )}
              style={
                activeTab === item.id
                  ? { backgroundColor: accentColor + '15', color: accentColor }
                  : undefined
              }
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-white/5">
          {currentUser && (
            <div className="flex items-center gap-3 mb-3 px-2">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: accentColor + '30' }}
              >
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {currentUser.name}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {currentUser.email}
                </div>
              </div>
            </div>
          )}
          <button
            onClick={() => setRole(null)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Switch Role
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-dvh">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-surface-950/80 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-white">
                {title || navItems.find((n) => n.id === activeTab)?.label || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onTabChange('notifications')}
                className="relative p-2.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface-900/95 backdrop-blur-xl border-t border-white/5 safe-bottom z-20">
          <div className="flex justify-around py-2 px-2">
            {navItems.slice(0, 5).map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all min-w-[60px]',
                  activeTab === item.id ? 'text-white' : 'text-slate-500'
                )}
                style={
                  activeTab === item.id ? { color: accentColor } : undefined
                }
              >
                {React.cloneElement(item.icon as React.ReactElement, {
                  className: 'w-5 h-5',
                })}
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-surface-900 animate-slide-in-right flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-xl">🥬</span>
                <span className="font-display font-bold text-white">
                  EdemFarm
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    activeTab === item.id
                      ? 'text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  )}
                  style={
                    activeTab === item.id
                      ? {
                          backgroundColor: accentColor + '15',
                          color: accentColor,
                        }
                      : undefined
                  }
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="p-4 border-t border-white/5">
              <button
                onClick={() => {
                  setRole(null);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Switch Role
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
