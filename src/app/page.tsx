'use client';

import { useAppStore } from '@/lib/app-store';
import { WelcomeScreen, AuthScreen } from '@/components/onboarding/welcome-auth';
import { CustomerApp } from '@/components/customer/customer-app';
import { DriverApp } from '@/components/driver/driver-app';
import { FarmerApp } from '@/components/farmer/farmer-app';
import { AdminApp } from '@/components/admin/admin-app';

export default function Home() {
  const { role, onboardingSeen, authedEmail, authedRole } = useAppStore();

  // Step 1: Welcome onboarding (first launch only)
  if (!onboardingSeen) return <WelcomeScreen />;

  // Step 2: Auth — must sign in/up with role (no free role switching)
  if (!authedEmail || !authedRole) return <AuthScreen />;

  // Step 3: App — role was set during auth, no manual selection
  const activeRole = role || authedRole;
  switch (activeRole) {
    case 'customer': return <CustomerApp />;
    case 'driver': return <DriverApp />;
    case 'farmer': return <FarmerApp />;
    case 'owner': return <AdminApp />;
    default: return <AuthScreen />;
  }
}
