import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';
  const intendedRole = searchParams.get('intendedRole'); // consumer|driver|farmer for OAuth signup

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // If this is an OAuth signup with intended role, set it on profile if not already set
      if (intendedRole && ['consumer', 'driver', 'farmer'].includes(intendedRole)) {
        // Check if profile already has a role (existing user) or is new
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        
        // Only update if profile is default 'consumer' and user explicitly picked different role
        // (admins stay as admin; existing non-default roles are preserved)
        if (profile?.role === 'consumer' && intendedRole !== 'consumer') {
          await supabase.from('profiles').update({ role: intendedRole }).eq('id', data.user.id);
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      if (forwardedHost) return NextResponse.redirect(`https://${forwardedHost}${next}`);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/?error=auth`);
}
