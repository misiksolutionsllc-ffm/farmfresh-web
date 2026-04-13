'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Database, Action, INITIAL_DB, dbReducer, UserRole, loadDatabase, saveDatabase } from './store';

interface Toast { message: string; type: 'success' | 'error' | 'info'; id: string; }

interface Account {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  provider: 'email' | 'google' | 'apple';
}

// Admin credentials (hardcoded)
const ADMIN_EMAIL = 'misiksolutionsllc@gmail.com';
const ADMIN_PASSWORD = 'Qwerty1986Q';

interface AppState {
  db: Database;
  role: UserRole | null;
  currentUserId: string | null;
  toast: Toast | null;
  sidebarOpen: boolean;
  onboardingSeen: boolean;
  authedEmail: string | null;
  authedProvider: 'email' | 'google' | 'apple' | null;
  authedRole: UserRole | null;
  accounts: Account[];

  dispatch: (action: Action) => void;
  setRole: (role: UserRole | null) => void;
  setCurrentUserId: (id: string | null) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
  setSidebarOpen: (open: boolean) => void;
  completeOnboarding: () => void;
  signUp: (email: string, password: string, name: string, role: UserRole, provider?: 'email' | 'google' | 'apple') => string | null;
  signIn: (email: string, password: string) => string | null;
  signInOAuth: (email: string, provider: 'google' | 'apple') => string | null;
  signOut: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      db: INITIAL_DB,
      role: null,
      currentUserId: null,
      toast: null,
      sidebarOpen: false,
      onboardingSeen: false,
      authedEmail: null,
      authedProvider: null,
      authedRole: null,
      accounts: [],

      dispatch: (action: Action) => {
        set((state) => {
          const newDb = dbReducer(state.db, action);
          if (typeof window !== 'undefined') {
            try { saveDatabase(newDb); } catch {}
          }
          return { db: newDb };
        });
      },

      setRole: (role) => {
        set({ role });
        const { db } = get();
        if (role) {
          const user = db.users.find((u) => u.role === role);
          if (user) set({ currentUserId: user.id });
        } else {
          set({ currentUserId: null });
        }
      },

      setCurrentUserId: (id) => set({ currentUserId: id }),

      showToast: (message, type = 'success') => {
        const id = `toast-${Date.now()}`;
        set({ toast: { message, type, id } });
        setTimeout(() => { const c = get().toast; if (c?.id === id) set({ toast: null }); }, 3500);
      },

      hideToast: () => set({ toast: null }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      completeOnboarding: () => set({ onboardingSeen: true }),

      // Sign up with role
      signUp: (email, password, name, role, provider = 'email') => {
        const { accounts, db } = get();

        // Admin check
        if (role === 'owner') return 'Admin access requires authorized credentials';
        if (email.toLowerCase() === ADMIN_EMAIL) return 'This email is reserved';

        // Check duplicate
        if (accounts.find((a) => a.email.toLowerCase() === email.toLowerCase() && a.role === role)) {
          return 'Account already exists for this role. Please sign in.';
        }

        // Register
        const newAccounts = [...accounts, { email: email.toLowerCase(), password, role, name, provider }];

        // Create user in DB if not exists
        let newDb = { ...db };
        const existingUser = newDb.users.find((u) => u.role === role);
        if (existingUser) {
          newDb = dbReducer(newDb, { type: 'UPDATE_USER_PROFILE', userId: existingUser.id, updates: { name, email: email.toLowerCase(), phone: '' } });
        }
        saveDatabase(newDb);

        const user = newDb.users.find((u) => u.role === role);
        set({
          accounts: newAccounts,
          authedEmail: email.toLowerCase(),
          authedProvider: provider,
          authedRole: role,
          role,
          currentUserId: user?.id || null,
          db: newDb,
        });
        return null; // success
      },

      // Sign in with email + password
      signIn: (email, password) => {
        const { accounts, db } = get();

        // Admin login
        if (email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          const adminUser = db.users.find((u) => u.role === 'owner');
          set({
            authedEmail: ADMIN_EMAIL,
            authedProvider: 'email',
            authedRole: 'owner',
            role: 'owner',
            currentUserId: adminUser?.id || null,
          });
          return null;
        }

        // Check admin wrong password
        if (email.toLowerCase() === ADMIN_EMAIL) return 'Invalid admin password';

        // Find account
        const account = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password);
        if (!account) return 'Invalid email or password. Please sign up first.';

        const user = db.users.find((u) => u.role === account.role);
        set({
          authedEmail: account.email,
          authedProvider: account.provider,
          authedRole: account.role,
          role: account.role,
          currentUserId: user?.id || null,
        });
        return null;
      },

      // OAuth sign in (auto-creates account if new)
      signInOAuth: (email, provider) => {
        const { accounts, db } = get();

        // Admin via OAuth
        if (email.toLowerCase() === ADMIN_EMAIL) {
          const adminUser = db.users.find((u) => u.role === 'owner');
          set({ authedEmail: ADMIN_EMAIL, authedProvider: provider, authedRole: 'owner', role: 'owner', currentUserId: adminUser?.id || null });
          return null;
        }

        // Find existing OAuth account
        const account = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
        if (account) {
          const user = db.users.find((u) => u.role === account.role);
          set({ authedEmail: account.email, authedProvider: provider, authedRole: account.role, role: account.role, currentUserId: user?.id || null });
          return null;
        }

        // New OAuth user — needs role selection, return special code
        set({ authedEmail: email.toLowerCase(), authedProvider: provider });
        return 'NEEDS_ROLE';
      },

      signOut: () => {
        set({ role: null, currentUserId: null, authedEmail: null, authedProvider: null, authedRole: null });
      },
    }),
    {
      name: 'farmfresh-app-state',
      version: 6, // Force re-auth — role-based accounts required
      partialize: (state) => ({
        onboardingSeen: state.onboardingSeen,
        authedEmail: state.authedEmail,
        authedProvider: state.authedProvider,
        authedRole: state.authedRole,
        accounts: state.accounts,
      }),
    }
  )
);

if (typeof window !== 'undefined') {
  try {
    const saved = loadDatabase();
    if (saved) useAppStore.setState({ db: saved });
  } catch {}
}
