'use client';

import { useAppStore } from '@/lib/app-store';
import { WelcomeScreen, AuthScreen } from '@/components/onboarding/welcome-auth';
import { RoleSelection } from '@/components/role-selection';
import { CustomerApp } from '@/components/customer/customer-app';
import { DriverApp } from '@/components/driver/driver-app';
import { FarmerApp } from '@/components/farmer/farmer-app';
import { AdminApp } from '@/components/admin/admin-app';

export default function Home() {
  const { role, onboardingSeen, authedEmail } = useAppStore();

  // Step 1: Welcome onboarding (first launch only)
  if (!onboardingSeen) return <WelcomeScreen />;

  // Step 2: Auth (if not signed in)
  if (!authedEmail) return <AuthScreen />;

  // Step 3: Role selection
  if (!role) return <RoleSelection />;

  // Step 4: App
  switch (role) {
    case 'customer': return <CustomerApp />;
    case 'driver': return <DriverApp />;
    case 'farmer': return <FarmerApp />;
    case 'owner': return <AdminApp />;
    default: return <RoleSelection />;
  }
}
