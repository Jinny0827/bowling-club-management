import axios, { AxiosInstance, AxiosError } from 'axios';
import { AuthResponse, LoginRequest, RegisterRequest, User, ApiResponse } from './types';
import Cookies from 'js-cookie';

class ApiClient {
  private client: AxiosInstance;
  // todo 백엔드 개발서버 (임시 주소)
  private baseURL = 'http://localhost:3000';

  constructor() {
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    })

    // 요청 인터셉터 - JWT 토큰 자동 추가
    this.client.interceptors.request.use(
        (config) => {
          const token = Cookies.get('accessToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        (error) => Promise.reject(error)
    );

    // 응답 인터셉터 - JWT 토큰 만료시 자동 로그아웃
    this.client.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
          if (error.response?.status === 401) {
            // 토큰 만료 또는 인증 실패
            this.logout();
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }
    );
  } // end Constructor


  // 회원가입
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await this.client.post<AuthResponse>('/api/auth/register', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // 로그인
  async login(data: LoginRequest): Promise<AuthResponse> {
    try{
      const response = await this.client.post<AuthResponse>('/api/auth/login', data);

      // JWT 토큰 저장 (유효기간 7일)
      if (response.data.data.accessToken) {
        Cookies.set('accessToken', response.data.data.accessToken, {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // 현재 사용자 정보 조회
  async getCurrentUser(): Promise<User> {
    try {
      const response = await this.client.get<ApiResponse<User>>('/api/auth/me');
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // 프로필 조회
  async getProfile(): Promise<User> {
    try {
      const response = await this.client.get<ApiResponse<User>>('/api/auth/profile');
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }


  // 로그아웃
  logout(): void {
    Cookies.remove('accessToken');
  }

  // 토큰 존재 여부 확인
  isAuthenticated(): boolean {
    return !!Cookies.get('accessToken');
  }

  // 에러 처리 헬퍼
  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      return new Error(message);
    }
    return new Error('알 수 없는 오류가 발생했습니다.');
  }
}

export const apiClient = new ApiClient();