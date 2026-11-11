import { create } from 'zustand';
import { authApi } from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // starts true to check session on mount

  setUser: (user) =>
    set({ user, isAuthenticated: !!user, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const res = await authApi.getMe();
      set({ user: res.data.data.user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      // SQA FIX (BUG-08, High): a failed session check used to clear the
      // user for ANY error — including 429 rate-limit, 500 and network
      // blips — logging legitimate users out. Only a 401 means the
      // session is actually invalid; anything else keeps the session.
      if (err?.response?.status === 401) {
        set({ user: null, isAuthenticated: false, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    }
  },

  login: async (credentials) => {
    const res = await authApi.login(credentials);
    const user = res.data.data.user;
    set({ user, isAuthenticated: true });
    return user;
  },

  register: async (data) => {
    const res = await authApi.register(data);
    const user = res.data.data.user;
    set({ user, isAuthenticated: true });
    return user;
  },

  logout: async () => {
    await authApi.logout();
    set({ user: null, isAuthenticated: false });
  },

  isAdmin: () => get().user?.role === 'admin',
}));

export default useAuthStore;
