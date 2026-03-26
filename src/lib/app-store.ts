'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Database,
  Action,
  INITIAL_DB,
  dbReducer,
  UserRole,
  loadDatabase,
  saveDatabase,
} from './store';

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  id: string;
}

interface AppState {
  db: Database;
  role: UserRole | null;
  currentUserId: string | null;
  toast: Toast | null;
  sidebarOpen: boolean;
  dispatch: (action: Action) => void;
  setRole: (role: UserRole | null) => void;
  setCurrentUserId: (id: string | null) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()((set, get) => ({
  db: INITIAL_DB,
  role: null,
  currentUserId: null,
  toast: null,
  sidebarOpen: false,

  dispatch: (action: Action) => {
    set((state) => {
      const newDb = dbReducer(state.db, action);
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        try {
          saveDatabase(newDb);
        } catch (e) {
          console.error('Failed to save:', e);
        }
      }
      return { db: newDb };
    });
  },

  setRole: (role) => {
    set({ role });
    // Auto-select user based on role
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
    setTimeout(() => {
      const current = get().toast;
      if (current?.id === id) set({ toast: null });
    }, 3500);
  },

  hideToast: () => set({ toast: null }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));

// Initialize from localStorage on client
if (typeof window !== 'undefined') {
  try {
    const saved = loadDatabase();
    if (saved) {
      useAppStore.setState({ db: saved });
    }
  } catch (e) {
    console.error('Failed to load database:', e);
  }
}
