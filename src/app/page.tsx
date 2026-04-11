'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/app-store';
import { createClient } from '@/lib/supabase/client';
import { WelcomeScreen, AuthScreen } from '@/components/onboarding/welcome-auth';
import { CustomerApp } from '@/components/customer/customer-app';
import { DriverApp } from '@/components/driver/driver-app';
import { FarmerApp } from '@/components/farmer/farmer-app';
import { AdminApp } from '@/components/admin/admin-app';
import { UserRole } from '@/lib/store';

const supabase = createClient();

export default function Home() {
  const { onboardingSeen, authedRole, role } = useAppStore();
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check Supabase session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Fetch role from profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', session.user.id)
          .single();

        const roleMap: Record<string, UserRole> = { consumer: 'customer', driver: 'driver', farmer: 'farmer', admin: 'owner' };
        const appRole = roleMap[profile?.role || 'consumer'] || 'customer';
        
        useAppStore.setState({
          authedEmail: session.user.email,
          authedRole: appRole,
          role: appRole,
        });
        setAuthenticated(true);
      }
      setChecking(false);
    });

    // Listen for auth changes (OAuth callback, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', session.user.id)
          .single();

        const roleMap: Record<string, UserRole> = { consumer: 'customer', driver: 'driver', farmer: 'farmer', admin: 'owner' };
        const appRole = roleMap[profile?.role || 'consumer'] || 'customer';

        useAppStore.setState({
          authedEmail: session.user.email,
          authedRole: appRole,
          role: appRole,
        });
        setAuthenticated(true);
      } else {
        useAppStore.setState({ authedEmail: null, authedRole: null, role: null });
        setAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Loading
  if (checking) {
    return (
      <div className="min-h-dvh bg-surface-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Step 1: Welcome onboarding
  if (!onboardingSeen) return <WelcomeScreen />;

  // Step 2: Auth
  if (!authenticated) return <AuthScreen />;

  // Step 3: App by role
  const activeRole = role || authedRole;
  switch (activeRole) {
    case 'customer': return <CustomerApp />;
    case 'driver': return <DriverApp />;
    case 'farmer': return <FarmerApp />;
    case 'owner': return <AdminApp />;
    default: return <AuthScreen />;
  }
}
