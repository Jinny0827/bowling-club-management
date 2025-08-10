// src/lib/api/auth.ts
import { BaseApiClient } from './base';
import { AuthResponse, LoginRequest, RegisterRequest, User, ApiResponse } from '../types';
import Cookies from 'js-cookie';

export class AuthApi extends BaseApiClient {
    // 회원가입
    async register(data: RegisterRequest): Promise<AuthResponse> {
        try {
            const response = await this.client.post<AuthResponse>('/api/auth/register', data);

            // 회원가입 성공 시 토큰 저장
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

    // 로그인
    async login(data: LoginRequest): Promise<AuthResponse> {
        try {
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
            console.log('getCurrentUser 호출'); // 디버깅용

            // 먼저 /api/auth/me 시도, 실패하면 /api/auth/profile 시도
            let response;
            try {
                response = await this.client.get<ApiResponse<User>>('/api/auth/me');
            } catch (error) {
                console.log(error, '/api/auth/me 실패, /api/auth/profile 시도'); // 디버깅용
                response = await this.client.get<ApiResponse<User>>('/api/auth/profile');
            }

            console.log('getCurrentUser 응답:', response.data); // 디버깅용
            return response.data.data!;
        } catch (error) {
            console.error('getCurrentUser 에러:', error); // 디버깅용
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
}