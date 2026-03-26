import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid Date';
  }
}

export function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateString);
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    Pending: 'bg-amber-500/20 text-amber-400',
    Processing: 'bg-blue-500/20 text-blue-400',
    Ready: 'bg-emerald-500/20 text-emerald-400',
    'Picked Up': 'bg-indigo-500/20 text-indigo-400',
    Shipped: 'bg-violet-500/20 text-violet-400',
    Delivered: 'bg-green-500/20 text-green-400',
    Cancelled: 'bg-red-500/20 text-red-400',
    Accepted: 'bg-cyan-500/20 text-cyan-400',
    active: 'bg-emerald-500/20 text-emerald-400',
    banned: 'bg-red-500/20 text-red-400',
    approved: 'bg-green-500/20 text-green-400',
    rejected: 'bg-red-500/20 text-red-400',
    pending: 'bg-amber-500/20 text-amber-400',
    expired: 'bg-gray-500/20 text-gray-400',
  };
  return map[status] || 'bg-slate-500/20 text-slate-400';
}

export function getRoleColor(role: string): string {
  const map: Record<string, string> = {
    customer: '#059669',
    driver: '#2563EB',
    farmer: '#EA580C',
    owner: '#DC2626',
  };
  return map[role] || '#64748B';
}

export function getRoleLabel(role: string): string {
  const map: Record<string, string> = {
    customer: 'Consumer',
    driver: 'Driver',
    farmer: 'Merchant',
    owner: 'Admin',
  };
  return map[role] || role;
}
