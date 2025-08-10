// src/lib/api/base.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import Cookies from 'js-cookie';

export class BaseApiClient {
    protected client: AxiosInstance;
    // todo 임시 주소 (로컬/개발/운영 분기 예정)
    protected baseURL = 'http://localhost:3000';

    constructor() {
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
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
                const isLoginRequest = error.config?.url?.includes('/auth/login');
                const isRegisterRequest = error.config?.url?.includes('/auth/register');

                if (error.response?.status === 401 && !isLoginRequest && !isRegisterRequest) {
                    // 로그인/회원가입 요청이 아닌 경우에만 자동 로그아웃 및 리다이렉트
                    this.logout();
                    if (typeof window !== 'undefined') {
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(error);
            }
        );
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
    protected handleError(error: unknown): Error {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.message;
            return new Error(message);
        }
        return new Error('알 수 없는 오류가 발생했습니다.');
    }
}