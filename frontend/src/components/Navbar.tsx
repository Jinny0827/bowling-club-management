'use client';

import {useAuthStore} from "@/store/authStore";
import {useState} from "react";
import { LogOut, User, Settings, Trophy } from 'lucide-react';
import {useRouter} from "next/navigation";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleLogin = () => {
    router.push('/login');
  }


  return (
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 로고 */}
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-blue-600" />
              <h1
                  className="text-xl font-bold text-gray-900 cursor-pointer"
                  onClick={() => router.push('/')}
              >
                볼링 클럽 관리
              </h1>
            </div>

            {/* 네비게이션 메뉴 */}
            <div className="hidden md:flex items-center space-x-8">
              {isAuthenticated && (
                  <>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      대시보드
                    </button>
                    <button
                        onClick={() => router.push('/clubs')}
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      클럽
                    </button>
                    <button
                        onClick={() => router.push('/games')}
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      게임 기록
                    </button>
                    <button
                        onClick={() => router.push('/dues')}
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      회비 관리
                    </button>
                  </>
              )}
            </div>

            {/* 사용자 메뉴 */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                  <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      <User className="h-5 w-5" />
                      <span>{user?.name}</span>
                      <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                          <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                            <div className="font-medium">{user?.name}</div>
                            <div className="text-gray-500">{user?.email}</div>
                          </div>

                          <button
                              onClick={() => {
                                setShowUserMenu(false);
                                router.push('/profile');
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Settings className="h-4 w-4 mr-3" />
                            프로필 설정
                          </button>

                          <button
                              onClick={() => {
                                setShowUserMenu(false);
                                handleLogout();
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="h-4 w-4 mr-3" />
                            로그아웃
                          </button>
                        </div>
                    )}
                  </div>
              ) : (
                  <button
                      onClick={handleLogin}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    로그인
                  </button>
              )}
            </div>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isAuthenticated && (
            <div className="md:hidden border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                  대시보드
                </button>
                <button
                    onClick={() => router.push('/clubs')}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                  클럽
                </button>
                <button
                    onClick={() => router.push('/games')}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                  게임 기록
                </button>
                <button
                    onClick={() => router.push('/dues')}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                  회비 관리
                </button>
              </div>
            </div>
        )}
      </nav>
  );
}