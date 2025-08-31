import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, LoginRequest } from './types';
import { getCurrentUser, login } from './api';

// Helper function to get the access token from the store
export function getAccessToken(): string | null {
  return useAuthStore.getState().token;
}

export const useAuthStore = create<AuthState & {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  getUser: () => Promise<void>;
}>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginRequest) => {
        console.log('login: Attempting to log in', { username: credentials.username });
        set({ isLoading: true, error: null });
        try {
          const response = await login(credentials);
          console.log('login: Login successful, token received');
          set({
            token: response.access_token,
            isAuthenticated: true,
            isLoading: false,
          });
          // Get user info
          console.log('login: Getting user info after successful login');
          await get().getUser();

          // Ensure we're authenticated after getting user info
          set(state => ({
            ...state,
            isAuthenticated: true,
            isLoading: false,
          }));
        } catch (error) {
          console.error('login: Login failed', error);
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
            isAuthenticated: false,
            token: null,
            user: null,
          });
        }
      },

      logout: () => {
        console.log('logout: Logging out user');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
        console.log('logout: User logged out successfully');
      },

      getUser: async () => {
        const { token } = get();
        if (!token) {
          console.log('getUser: No token available');
          set({ isAuthenticated: false, user: null });
          return;
        }

        console.log('getUser: Fetching user info with token');
        set({ isLoading: true, error: null });
        try {
          const user = await getCurrentUser(token);
          console.log('getUser: User info retrieved successfully', user);
          set({ user, isLoading: false, isAuthenticated: true });
        } catch (error) {
          console.error('getUser: Failed to get user info', error);
          // If we can't get the user info, the token might be invalid
          set({
            error: error instanceof Error ? error.message : 'Failed to get user info',
            isLoading: false,
            // Set isAuthenticated to false if we can't get user info
            isAuthenticated: false,
            user: null
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        // Don't persist user or isAuthenticated - we'll fetch user info on app load
      }),
      onRehydrateStorage: () => (state) => {
        console.log('auth-storage: Rehydrated state', { hasToken: !!state?.token });
        // If we have a token after rehydration, try to get the user info
        if (state?.token) {
          console.log('auth-storage: Token found after rehydration, getting user info');
          // Set authenticated state immediately to avoid flicker
          state.isAuthenticated = true;
          // Then get user info
          state.getUser();
        } else {
          // No token, ensure we're not authenticated
          state.isAuthenticated = false;
          state.user = null;
        }
      }
    }
  )
);
