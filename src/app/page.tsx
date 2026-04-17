'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/app-store';
import { WelcomeScreen, AuthScreen } from '@/components/onboarding/welcome-auth';
import { ConsumerWelcome, DriverWelcome, FarmerWelcome } from '@/components/onboarding/role-welcome';
import { CustomerApp } from '@/components/customer/customer-app';
import { DriverApp } from '@/components/driver/driver-app';
import { FarmerApp } from '@/components/farmer/farmer-app';
import { AdminApp } from '@/components/admin/admin-app';
import { UserRole } from '@/lib/store';

export default function Home() {
  const { onboardingSeen, authedRole, role, seenRoleIntros, markRoleIntroSeen } = useAppStore();
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;
    const timeout = setTimeout(() => {
      if (mounted) setChecking(false);
    }, 3000);

    async function checkAuth() {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session?.user) {
          if (mounted) setChecking(false);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', session.user.id)
          .single();

        const roleMap: Record<string, UserRole> = { consumer: 'customer', driver: 'driver', farmer: 'farmer', admin: 'owner' };
        const appRole = roleMap[profile?.role || 'consumer'] || 'customer';

        if (mounted) {
          useAppStore.setState({
            authedEmail: session.user.email,
            authedRole: appRole,
            role: appRole,
          });
          setAuthenticated(true);
          setChecking(false);
        }

        supabase.auth.onAuthStateChange(async (_event: string, sess: any) => {
          if (!mounted) return;
          if (sess?.user) {
            const { data: p } = await supabase.from('profiles').select('role').eq('id', sess.user.id).single();
            const r = roleMap[p?.role || 'consumer'] || 'customer';
            useAppStore.setState({ authedEmail: sess.user.email, authedRole: r, role: r });
            setAuthenticated(true);
          } else {
            useAppStore.setState({ authedEmail: null, authedRole: null, role: null });
            setAuthenticated(false);
          }
        });
      } catch (err) {
        console.error('Auth check failed:', err);
        if (mounted) setChecking(false);
      }
    }

    checkAuth();
    return () => { mounted = false; clearTimeout(timeout); };
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

  // Step 1: Universal welcome (5 photo slides)
  if (!onboardingSeen) return <WelcomeScreen />;

  // Step 2: Auth
  if (!authenticated) return <AuthScreen />;

  const activeRole = role || authedRole;

  // Step 3: Role-specific intro (shown once per role)
  if (activeRole === 'customer' && !seenRoleIntros?.customer) {
    return <ConsumerWelcome onComplete={() => markRoleIntroSeen('customer')} />;
  }
  if (activeRole === 'driver' && !seenRoleIntros?.driver) {
    return <DriverWelcome onComplete={() => markRoleIntroSeen('driver')} />;
  }
  if (activeRole === 'farmer' && !seenRoleIntros?.farmer) {
    return <FarmerWelcome onComplete={() => markRoleIntroSeen('farmer')} />;
  }

  // Step 4: App by role
  switch (activeRole) {
    case 'customer': return <CustomerApp />;
    case 'driver': return <DriverApp />;
    case 'farmer': return <FarmerApp />;
    case 'owner': return <AdminApp />;
    default: return <AuthScreen />;
  }
}
