import { create } from 'zustand';
import { User, LoginRequest, RegisterRequest } from '@/lib/types';
import { apiClient } from '@/lib/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthActions {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  // 상태
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  // 액션들
  login: async (data:LoginRequest) => {
    try {
      set({isLoading: true, error: null});

      const response = await apiClient.login(data);

      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: true,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '로그인에 실패했습니다.',
        isLoading: false,
        isAuthenticated: false,
      })
      throw error;
    }
  },

  register: async (data: RegisterRequest) => {
    try {
      set({ isLoading: true, error: null });

      const response = await apiClient.register(data);

      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '회원가입에 실패했습니다.',
        isLoading: false,
        isAuthenticated: false
      });
      throw error;
    }
  },

  logout: () => {
    apiClient.logout();
    set({
      user: null,
      isAuthenticated: false,
      error: null
    });
  },

  fetchUser: async () => {
    try {
      if (!apiClient.isAuthenticated()) {
        set({ isAuthenticated: false, user: null });
        return;
      }

      set({ isLoading: true });
      const user = await apiClient.getCurrentUser();

      set({
        user,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : '사용자 정보 조회에 실패했습니다.'
      });
    }
  },

  checkAuth: async () => {
    if (apiClient.isAuthenticated()) {
      await get().fetchUser();
    }
  },

  clearError: () => set({ error: null }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));