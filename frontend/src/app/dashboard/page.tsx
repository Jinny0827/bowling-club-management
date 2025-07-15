'use client';

import { useAuthStore } from '@/store/authStore';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Trophy, Users, BarChart3, CreditCard, Calendar, Award } from 'lucide-react';


export default function DashboardPage() {
  const { user } = useAuthStore();


  const stats = [
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: '소속 클럽',
      value: '3개',
      description: '활성 클럽 수'
    },
    {
      icon: <Trophy className="h-8 w-8 text-yellow-600" />,
      title: '총 게임',
      value: '24회',
      description: '이번 달 게임 수'
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-green-600" />,
      title: '평균 점수',
      value: '142점',
      description: '최근 10게임 평균'
    },
    {
      icon: <Award className="h-8 w-8 text-purple-600" />,
      title: '최고 점수',
      value: '187점',
      description: '개인 최고 기록'
    }
  ];

  const recentActivities = [
    {
      type: 'game',
      title: '게임 완료',
      description: '강남 볼링장 - 점수: 156점',
      time: '2시간 전',
      icon: <Trophy className="h-5 w-5 text-yellow-600" />
    },
    {
      type: 'dues',
      title: '회비 납부',
      description: '드래곤볼 클럽 - 50,000원',
      time: '1일 전',
      icon: <CreditCard className="h-5 w-5 text-green-600" />
    },
    {
      type: 'club',
      title: '클럽 가입',
      description: '스트라이크 클럽에 가입했습니다',
      time: '3일 전',
      icon: <Users className="h-5 w-5 text-blue-600" />
    }
  ];

  return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              안녕하세요, {user?.name}님! 👋
            </h1>
            <p className="text-gray-600">
              오늘도 좋은 게임 되세요!
            </p>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      {stat.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-lg font-medium text-gray-700 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {stat.description}
                  </p>
                </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 최근 활동 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  최근 활동
                </h2>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                      <div
                          key={index}
                          className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          {activity.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 빠른 액션 */}
            <div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  빠른 액션
                </h2>
                <div className="space-y-3">
                  <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                    <Trophy className="h-5 w-5" />
                    <span>게임 기록 추가</span>
                  </button>
                  <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>클럽 찾기</span>
                  </button>
                  <button className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>회비 납부</span>
                  </button>
                  <button className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>일정 확인</span>
                  </button>
                </div>
              </div>

              {/* 프로필 카드 */}
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  내 프로필
                </h2>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">{user?.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
                  <p className="text-sm text-gray-600">{user?.phoneNumber}</p>
                  <button className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
                    프로필 편집
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
  );
}