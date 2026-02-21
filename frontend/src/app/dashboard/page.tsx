// frontend/src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import ProtectedRoute from '@/components/ProtectedRoute';
import GameRecordModal from '@/components/GameRecordModal';
import {
  Trophy,
  Users,
  Target,
  Plus,
  Clock,
  Award,
  UserPlus,
  Calendar,
  CreditCard,
  BarChart3,
  Star,
  Zap,
  RefreshCw,
  X
} from 'lucide-react';
import { apiClient } from '@/lib/api';

// 🎯 정확한 타입 정의
interface RecentGame {
  id: string;
  totalScore: number;
  gameDate: string | Date;
  clubName: string;
  gameOrder: number;
}

interface ClubActivity {
  type: 'game' | 'member';
  title: string;
  description: string;
  time: string | Date;
  icon: string;
}

interface ClubMembership {
  clubId: string;
  clubName: string;
  role: string;
  joinedDate: string | Date;
}

interface DashboardStats {
  totalGames: number;
  averageScore: number;
  highestScore: number;
  recentGames: RecentGame[];
  clubActivities: ClubActivity[];
  clubMemberships: ClubMembership[];
}

const getActivityIcon = (type: 'game' | 'member') => {
  switch (type) {
    case 'game':
      return <Trophy className="h-5 w-5 text-blue-400" />;
    case 'member':
      return <UserPlus className="h-5 w-5 text-green-400" />;
    default:
      return <Clock className="h-5 w-5 text-gray-400" />;
  }
};

const formatTimeAgo = (date: string | Date): string => {
  const now = new Date();
  const gameDate = new Date(date);
  const diffHours = Math.floor((now.getTime() - gameDate.getTime()) / (1000 * 60 * 60));

  if (diffHours < 1) return '방금 전';
  if (diffHours < 24) return `${diffHours}시간 전`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일 전`;
  return gameDate.toLocaleDateString('ko-KR');
};

const getScoreColor = (score: number): string => {
  if (score >= 200) return 'text-yellow-400';
  if (score >= 150) return 'text-green-400';
  if (score >= 100) return 'text-blue-400';
  return 'text-white';
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGame, setSelectedGame] = useState<RecentGame | null>(null);

  const fetchDashboardData = async (): Promise<void> => {
    try {
      const response = await apiClient.getDashboardStats();
      setStats(response);
    } catch (error) {
      console.error('대시보드 데이터를 불러오는데 실패했습니다:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleGameAdded = (): void => {
    fetchDashboardData();
  };

  const statCards = [
    {
      title: '총 게임',
      value: stats?.totalGames || 0,
      description: '플레이한 게임 수',
      icon: <Trophy className="h-8 w-8 text-blue-400" />,
      gradient: 'from-blue-500/20 to-blue-600/20',
      border: 'border-blue-300/30',
      bgGlow: 'bg-blue-500/10'
    },
    {
      title: '평균 점수',
      value: stats?.averageScore || 0,
      description: '전체 평균',
      icon: <Target className="h-8 w-8 text-emerald-400" />,
      gradient: 'from-emerald-500/20 to-emerald-600/20',
      border: 'border-emerald-300/30',
      bgGlow: 'bg-emerald-500/10'
    },
    {
      title: '최고 점수',
      value: stats?.highestScore || 0,
      description: '개인 최고 기록',
      icon: <Award className="h-8 w-8 text-amber-400" />,
      gradient: 'from-amber-500/20 to-amber-600/20',
      border: 'border-amber-300/30',
      bgGlow: 'bg-amber-500/10'
    },
    {
      title: '클럽 수',
      value: stats?.clubMemberships?.length || 0,
      description: '가입한 클럽',
      icon: <Users className="h-8 w-8 text-purple-400" />,
      gradient: 'from-purple-500/20 to-purple-600/20',
      border: 'border-purple-300/30',
      bgGlow: 'bg-purple-500/10'
    }
  ];

  if (loading) {
    return (
        <ProtectedRoute>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
            <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-8">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                <span className="text-white text-lg">대시보드를 불러오는 중...</span>
              </div>
            </div>
          </div>
        </ProtectedRoute>
    );
  }

  return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="container mx-auto px-4 py-8">
            {/* 헤더 */}
            <div className="mb-8">
              <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                      안녕하세요, {user?.name}님! 👋
                    </h1>
                    <p className="text-white/70 text-lg">
                      오늘도 좋은 게임 되세요!
                    </p>
                  </div>

                  {/* 새로고침 버튼 */}
                  <button
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl hover:bg-white/20 transition-all duration-300 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-6 w-6 text-white ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat, index) => (
                  <div key={index} className="group relative">
                    <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    <div className={`relative backdrop-blur-xl bg-white/10 rounded-3xl border ${stat.border} p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 ${stat.bgGlow} backdrop-blur-xl rounded-2xl border ${stat.border}`}>
                          {stat.icon}
                        </div>
                        <div className="text-right">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-1">
                        {stat.value}
                      </h3>
                      <p className="text-lg font-medium text-white/90 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-sm text-white/60">
                        {stat.description}
                      </p>
                    </div>
                  </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 최근 게임 기록 */}
              <div className="lg:col-span-2">
                <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                      <BarChart3 className="h-6 w-6 text-blue-400" />
                      <span>최근 게임 기록</span>
                    </h2>
                    <div className="flex items-center space-x-2 text-white/60 text-sm">
                      <Star className="h-4 w-4" />
                      <span>최고 성과</span>
                    </div>
                  </div>

                  {stats?.recentGames && stats.recentGames.length > 0 ? (
                      <div className="space-y-4">
                        {stats.recentGames.map((game, index) => (
                            <div key={index} onClick={() => setSelectedGame(game)} className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-4 hover:bg-white/10 transition-all duration-300 group cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="p-2 bg-blue-500/20 backdrop-blur-xl rounded-xl border border-blue-300/30 group-hover:scale-110 transition-transform duration-300">
                                    <Trophy className="h-5 w-5 text-blue-400" />
                                  </div>
                                  <div>
                                    <p className={`text-lg font-bold ${getScoreColor(game.totalScore)}`}>
                                      {game.totalScore}점
                                    </p>
                                    <p className="text-white/60 text-sm flex items-center space-x-2">
                                      <Users className="h-4 w-4" />
                                      <span>{game.clubName}</span>
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-white/60 text-sm flex items-center space-x-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{formatTimeAgo(game.gameDate)}</span>
                                  </p>
                                  <p className="text-white/50 text-xs mt-1 flex items-center space-x-1">
                                    <Zap className="h-3 w-3" />
                                    <span>게임 #{game.gameOrder}</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                        ))}
                      </div>
                  ) : (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-4">
                          <Trophy className="h-10 w-10 text-white/30" />
                        </div>
                        <p className="text-white/60 text-lg mb-2">아직 게임 기록이 없습니다</p>
                        <p className="text-white/40">첫 게임을 기록해보세요!</p>
                      </div>
                  )}
                </div>
              </div>

              {/* 사이드바 */}
              <div className="space-y-6">
                {/* 빠른 액션 */}
                <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-6">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    <span>빠른 액션</span>
                  </h2>
                  <div className="space-y-3">
                    <button
                        onClick={() => setIsGameModalOpen(true)}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-4 rounded-2xl hover:from-blue-700 hover:to-blue-600 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:scale-105"
                    >
                      <Plus className="h-5 w-5" />
                      <span>게임 기록 추가</span>
                    </button>
                    <button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-3 px-4 rounded-2xl hover:from-emerald-700 hover:to-emerald-600 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:scale-105">
                      <Users className="h-5 w-5" />
                      <span>클럽 찾기</span>
                    </button>
                    <button className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white py-3 px-4 rounded-2xl hover:from-purple-700 hover:to-purple-600 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:scale-105">
                      <CreditCard className="h-5 w-5" />
                      <span>회비 납부</span>
                    </button>
                    <button className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white py-3 px-4 rounded-2xl hover:from-amber-700 hover:to-amber-600 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:scale-105">
                      <Calendar className="h-5 w-5" />
                      <span>일정 확인</span>
                    </button>
                  </div>
                </div>

                {/* 클럽 활동 */}
                <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-6">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                    <Users className="h-5 w-5 text-green-400" />
                    <span>클럽 활동</span>
                  </h2>
                  {stats?.clubActivities && stats.clubActivities.length > 0 ? (
                      <div className="space-y-4">
                        {stats.clubActivities.slice(0, 5).map((activity, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <div className="p-2 bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 mt-1">
                                {getActivityIcon(activity.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white">
                                  {activity.title}
                                </p>
                                <p className="text-sm text-white/60 mt-1">
                                  {activity.description}
                                </p>
                                <p className="text-xs text-white/40 mt-2 flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatTimeAgo(activity.time)}</span>
                                </p>
                              </div>
                            </div>
                        ))}
                      </div>
                  ) : (
                      <div className="text-center py-6">
                        <Users className="h-12 w-12 text-white/30 mx-auto mb-3" />
                        <p className="text-white/60 text-sm">클럽 활동이 없습니다</p>
                      </div>
                  )}
                </div>

                {/* 프로필 카드 */}
                <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-6">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-400" />
                    <span>내 프로필</span>
                  </h2>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-medium text-white">{user?.name}</h3>
                    <p className="text-sm text-white/60 mt-1">{user?.email}</p>
                    <p className="text-sm text-white/60">{user?.phoneNumber}</p>
                    <button className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                      프로필 편집
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 게임 기록 모달 */}
          <GameRecordModal
              isOpen={isGameModalOpen}
              onClose={() => setIsGameModalOpen(false)}
              onGameAdded={handleGameAdded}
          />
        </div>
      </ProtectedRoute>
  );
}