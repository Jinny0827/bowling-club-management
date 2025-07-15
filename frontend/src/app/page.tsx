// src/app/page.tsx

'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Trophy, Users, BarChart3, CreditCard, User, Sparkles } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const features = [
    {
      icon: <Users className="w-8 h-8 text-blue-300" />,
      title: '클럽 관리',
      description: '볼링장별 클럽 생성 및 회원 관리를 효율적으로 처리합니다'
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-emerald-300" />,
      title: '게임 기록',
      description: '상세한 점수 입력 및 통계 분석으로 실력 향상을 도와줍니다'
    },
    {
      icon: <CreditCard className="w-8 h-8 text-purple-300" />,
      title: '회비 관리',
      description: '투명한 회비 납부 기록 및 현황 관리 시스템입니다'
    },
    {
      icon: <Trophy className="w-8 h-8 text-amber-300" />,
      title: '권한 시스템',
      description: '체계적인 클럽 마스터, 부마스터, 회원 권한 관리'
    }
  ];

  return (
      <div className="min-h-screen relative overflow-hidden">
        {/* 배경 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>

        {/* 배경 장식 요소들 */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="relative z-10">
          {/* 히어로 섹션 */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
            <div className="text-center">
              {/* 글래스 카드 컨테이너 */}
              <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-12 shadow-2xl">
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl opacity-50"></div>
                    <div className="relative bg-white/20 backdrop-blur-xl p-4 rounded-full border border-white/30">
                      <Trophy className="w-16 h-16 text-white" />
                    </div>
                  </div>
                </div>

                <h1 className="text-6xl font-bold text-white mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  볼링 클럽 관리 시스템
                </h1>
                <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
                  볼링장과 클럽, 사용자를 연결하는 프리미엄 통합 관리 시스템으로
                  <br />게임 기록부터 회비 관리까지 모든 것을 우아하게 관리하세요
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <button
                      onClick={() => router.push('/register')}
                      className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-white font-semibold text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                    <span className="relative flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    시작하기
                  </span>
                  </button>
                  <button
                      onClick={() => router.push('/login')}
                      className="px-8 py-4 backdrop-blur-xl bg-white/10 border border-white/30 rounded-2xl text-white font-semibold text-lg hover:bg-white/20 transition-all duration-300 hover:scale-105"
                  >
                    로그인
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 기능 소개 섹션 */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold text-white mb-6">
                프리미엄 기능들
              </h2>
              <p className="text-white/70 text-lg max-w-2xl mx-auto">
                전문적이고 직관적인 인터페이스로 클럽 운영을 한 차원 높은 수준으로 끌어올리세요
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                  <div
                      key={index}
                      className="group relative"
                  >
                    {/* 글로우 효과 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* 메인 카드 */}
                    <div className="relative backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-8 hover:bg-white/15 transition-all duration-500 hover:scale-105 shadow-2xl">
                      <div className="flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-xl rounded-2xl mb-6 mx-auto border border-white/20 group-hover:border-white/40 transition-colors">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-4 text-center">
                        {feature.title}
                      </h3>
                      <p className="text-white/70 text-center leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
              ))}
            </div>
          </div>

          {/* 시스템 구조 섹션 */}
          <div className="py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-20">
                <h2 className="text-4xl font-bold text-white mb-6">
                  시스템 아키텍처
                </h2>
                <p className="text-white/70 text-lg max-w-2xl mx-auto">
                  효율적이고 확장 가능한 3단계 구조로 설계된 관리 시스템
                </p>
              </div>

              <div className="flex flex-col lg:flex-row items-center justify-center gap-12 mb-20">
                <div className="group relative">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-8 text-center min-w-[220px] hover:bg-white/15 transition-all duration-300">
                    <div className="w-20 h-20 bg-blue-500/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-300/30">
                      <Trophy className="w-10 h-10 text-blue-300" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">볼링장</h3>
                    <p className="text-white/70">시설 및 전체 관리</p>
                  </div>
                </div>

                <div className="hidden lg:block text-4xl text-white/30 font-bold">⟷</div>

                <div className="group relative">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-8 text-center min-w-[220px] hover:bg-white/15 transition-all duration-300">
                    <div className="w-20 h-20 bg-emerald-500/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-300/30">
                      <Users className="w-10 h-10 text-emerald-300" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">클럽</h3>
                    <p className="text-white/70">그룹별 활동 관리</p>
                  </div>
                </div>

                <div className="hidden lg:block text-4xl text-white/30 font-bold">⟷</div>

                <div className="group relative">
                  <div className="absolute inset-0 bg-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-8 text-center min-w-[220px] hover:bg-white/15 transition-all duration-300">
                    <div className="w-20 h-20 bg-purple-500/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-300/30">
                      <User className="w-10 h-10 text-purple-300" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">사용자</h3>
                    <p className="text-white/70">개인별 기록 관리</p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-8 max-w-2xl mx-auto">
                  <h3 className="text-2xl font-bold text-white mb-6">권한 체계</h3>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <div className="backdrop-blur-xl bg-gradient-to-r from-red-500/20 to-red-400/20 border border-red-300/30 text-white px-6 py-3 rounded-2xl font-semibold">
                      클럽 마스터
                    </div>
                    <div className="backdrop-blur-xl bg-gradient-to-r from-amber-500/20 to-yellow-400/20 border border-amber-300/30 text-white px-6 py-3 rounded-2xl font-semibold">
                      부마스터
                    </div>
                    <div className="backdrop-blur-xl bg-gradient-to-r from-blue-500/20 to-blue-400/20 border border-blue-300/30 text-white px-6 py-3 rounded-2xl font-semibold">
                      클럽원
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}