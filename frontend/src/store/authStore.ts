import { create } from 'zustand';
import Cookies from 'js-cookie';
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
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  // 상태
  user: null,
  isLoading: true, // 초기에는 로딩 상태로 시작
  isAuthenticated: false,
  error: null,

  // 액션들
  login: async (data: LoginRequest) => {
    try {
      set({ isLoading: true, error: null });

      const response = await apiClient.login(data);

      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '로그인에 실패했습니다.',
        isLoading: false,
        isAuthenticated: false,
      });
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
      // 토큰이 만료되었거나 유효하지 않은 경우
      Cookies.remove('accessToken');
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : '사용자 정보 조회에 실패했습니다.'
      });
    }
  },

  checkAuth: () => {

    // 앱 시작 시 토큰이 있으면 사용자 정보 복원 (비동기로 백그라운드에서 실행)
    if (apiClient.isAuthenticated()) {
      get().fetchUser().catch((error) => {
        console.error('사용자 정보 복원 실패:', error);
      });
    } else {
      console.log('토큰 없음, 로그아웃 상태로 설정'); // 디버깅용
      // 토큰이 없으면 로그아웃 상태로 설정
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  },

  clearError: () => set({ error: null }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));