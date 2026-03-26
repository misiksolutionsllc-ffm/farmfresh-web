'use client';

import { useAppStore } from '@/lib/app-store';
import { UserRole } from '@/lib/store';
import { RoleSelection } from '@/components/role-selection';
import { CustomerApp } from '@/components/customer/customer-app';
import { DriverApp } from '@/components/driver/driver-app';
import { MerchantApp } from '@/components/merchant/merchant-app';
import { AdminApp } from '@/components/admin/admin-app';

export default function Home() {
  const { role } = useAppStore();

  if (!role) return <RoleSelection />;

  switch (role) {
    case 'customer':
      return <CustomerApp />;
    case 'driver':
      return <DriverApp />;
    case 'farmer':
      return <MerchantApp />;
    case 'owner':
      return <AdminApp />;
    default:
      return <RoleSelection />;
  }
}
