export interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
  role?: 'MASTER' | 'SUB_MASTER' | 'MEMBER';
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  statusCode: number;
  message: string;
  data: {
    accessToken: string;
    user: User;
  };
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
}

export interface AuthError {
  message: string;
  statusCode: number;
}