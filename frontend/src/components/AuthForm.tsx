'use client';

// 스키마 정의
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {z} from "zod";
import {useState} from "react";
import {useAuthStore} from "@/store/authStore";
import {useRouter} from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';


const loginSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
})

const registerSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
  name: z.string().min(2, '이름은 2자 이상이어야 합니다'),
  phoneNumber: z.string().min(10, '올바른 전화번호를 입력해주세요'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface AuthFormProps {
  mode: 'login' | 'register';
  onToggleMode: () => void;
}

export default function AuthForm({ mode, onToggleMode }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { login, register: registerUser, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      phoneNumber: '',
    },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login(data);
      router.push('/dashboard');
    } catch (error) {
      // 에러는 store에서 처리됨
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      clearError();
      await registerUser(data);
      router.push('/dashboard');
    } catch (error) {
      // 에러는 store에서 처리됨
    }
  };

  const currentForm = mode === 'login' ? loginForm : registerForm;

  return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {mode === 'login' ? '로그인' : '회원가입'}
            </h2>
            <p className="mt-2 text-gray-600">
              {mode === 'login'
                  ? '볼링 클럽 관리 시스템에 오신 것을 환영합니다'
                  : '새로운 계정을 만들어보세요'
              }
            </p>
          </div>

          {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
          )}

          {/* 로그인 폼 */}
          {mode === 'login' && (
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      이메일
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                          id="email"
                          type="email"
                          {...loginForm.register('email')}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="example@email.com"
                      />
                    </div>
                    {loginForm.formState.errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {loginForm.formState.errors.email.message}
                        </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      비밀번호
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          {...loginForm.register('password')}
                          className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="••••••••"
                      />
                      <button
                          type="button"
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                        <p className="mt-1 text-sm text-red-600">
                          {loginForm.formState.errors.password.message}
                        </p>
                    )}
                  </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? '처리 중...' : '로그인'}
                </button>
              </form>
          )}

          {/* 회원가입 폼 */}
          {mode === 'register' && (
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      이름
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                          id="name"
                          type="text"
                          {...registerForm.register('name')}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="홍길동"
                      />
                    </div>
                    {registerForm.formState.errors.name && (
                        <p className="mt-1 text-sm text-red-600">
                          {registerForm.formState.errors.name.message}
                        </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      이메일
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                          id="email"
                          type="email"
                          {...registerForm.register('email')}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="example@email.com"
                      />
                    </div>
                    {registerForm.formState.errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {registerForm.formState.errors.email.message}
                        </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      전화번호
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                          id="phoneNumber"
                          type="tel"
                          {...registerForm.register('phoneNumber')}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="010-1234-5678"
                      />
                    </div>
                    {registerForm.formState.errors.phoneNumber && (
                        <p className="mt-1 text-sm text-red-600">
                          {registerForm.formState.errors.phoneNumber.message}
                        </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      비밀번호
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          {...registerForm.register('password')}
                          className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="••••••••"
                      />
                      <button
                          type="button"
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {registerForm.formState.errors.password && (
                        <p className="mt-1 text-sm text-red-600">
                          {registerForm.formState.errors.password.message}
                        </p>
                    )}
                  </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? '처리 중...' : '회원가입'}
                </button>
              </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {mode === 'login' ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
              <button
                  onClick={onToggleMode}
                  className="ml-1 text-blue-600 hover:text-blue-500 font-medium"
              >
                {mode === 'login' ? '회원가입' : '로그인'}
              </button>
            </p>
          </div>
        </div>
      </div>
  );
}