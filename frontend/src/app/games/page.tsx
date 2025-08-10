// frontend/src/app/games/page.tsx

'use client';

import {useAuthStore} from "@/store/authStore";
import {useEffect, useState} from "react";
import {apiClient} from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import {Calendar, Search, Target, TrendingUp, Trophy} from "lucide-react";
import {GameScore, SortOption} from "@/lib/types";

export default function GamesHistoryPage() {
    const { user } = useAuthStore();
    const [ games, setGames] = useState<GameScore[]>([]);
    const [ loading, setLoading ] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
    const [sortOption, setSortOption] = useState<SortOption>('date_desc');

    // 게임 데이터 로드
    const loadGames = async (page = 1) => {
        try {
            setLoading(true);
            const response = await apiClient.getMyGameScores({
                page: page,
                limit: pagination.limit,
                sort: sortOption,
                filters: searchTerm ? {
                    clubName: searchTerm,
                    bowlingCenterName: searchTerm
                } : undefined
            });
            setGames(response.data);  // gameScores → data
            setPagination(response.pagination);
        } catch (error) {
            console.error('게임 히스토리 로드 실패:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadGames();
    }, []);

    // 페이지 정렬
    const handlePageChange = (newPage: number) => {
        if(newPage >= 1 && newPage <= pagination.totalPages) {
            loadGames(newPage);
        }
    }

    // 게임 정렬
    const sortedGames = [...games].sort((a, b) => {
        if (sortBy === 'date') {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else {
            return b.score - a.score;
        }
    });

    // 검색 필터링
    const filteredGames = sortedGames.filter(game =>
        game.game?.club?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.game?.bowlingCenter?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* 헤더 */}
                    <div className="mb-8">
                        <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-8">
                            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                                <Trophy className="w-8 h-8 text-amber-400" />
                                게임 히스토리
                            </h1>
                            <p className="text-white/70">
                                {user?.name}님의 모든 게임 기록을 확인하세요
                            </p>
                        </div>
                    </div>

                    {/* 통계 요약 카드 */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                    <Trophy className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-white/70 text-sm">총 게임</p>
                                    <p className="text-white text-xl font-bold">{pagination.total}회</p>
                                </div>
                            </div>
                        </div>

                        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                    <Target className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-white/70 text-sm">평균 점수</p>
                                    <p className="text-white text-xl font-bold">
                                        {games.length > 0 ? Math.round(games.reduce((sum, game) => sum + game.score, 0) / games.length) : 0}점
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-white/70 text-sm">최고 점수</p>
                                    <p className="text-white text-xl font-bold">
                                        {games.length > 0 ? Math.max(...games.map(game => game.score)) : 0}점
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-white/70 text-sm">이번 달</p>
                                    <p className="text-white text-xl font-bold">
                                        {games.filter(game =>
                                            new Date(game.createdAt).getMonth() === new Date().getMonth()
                                        ).length}회
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 필터 및 검색 */}
                    <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6 mb-8">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="flex gap-4 items-center">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                                    <input
                                        type="text"
                                        placeholder="클럽이나 볼링장으로 검색..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as 'date' | 'score')}
                                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="date">최신순</option>
                                    <option value="score">점수순</option>
                                </select>
                            </div>

                            <div className="text-white/70 text-sm">
                                총 {filteredGames.length}개의 게임 기록
                            </div>
                        </div>
                    </div>

                    {/* 게임 기록 테이블 */}
                    <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/5">
                                <tr>
                                    <th className="px-6 py-4 text-left text-white font-semibold">날짜</th>
                                    <th className="px-6 py-4 text-left text-white font-semibold">점수</th>
                                    <th className="px-6 py-4 text-left text-white font-semibold">게임 순서</th>
                                    <th className="px-6 py-4 text-left text-white font-semibold">클럽</th>
                                    <th className="px-6 py-4 text-left text-white font-semibold">볼링장</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredGames.map((game, index) => (
                                    <tr key={game.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-white/90">
                                            {new Date(game.createdAt).toLocaleDateString('ko-KR', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                        <span className={`text-lg font-bold ${
                            game.score >= 150 ? 'text-emerald-400' :
                                game.score >= 120 ? 'text-amber-400' :
                                    'text-white'
                        }`}>
                          {game.score}점
                        </span>
                                        </td>
                                        <td className="px-6 py-4 text-white/90">
                                            {game.gameOrder}게임
                                        </td>
                                        <td className="px-6 py-4 text-white/90">
                                            {game.game?.club?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-white/90">
                                            {game.game?.bowlingCenter?.name || '-'}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* 페이지네이션 */}
                        {pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 p-6 border-t border-white/10">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                                >
                                    이전
                                </button>

                                <span className="text-white/70">
                  {pagination.page} / {pagination.totalPages}
                </span>

                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                                >
                                    다음
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 빈 상태 */}
                    {filteredGames.length === 0 && (
                        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-12 text-center">
                            <Trophy className="w-16 h-16 text-white/50 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">
                                게임 기록이 없습니다
                            </h3>
                            <p className="text-white/70">
                                첫 번째 게임을 기록해보세요!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );

}