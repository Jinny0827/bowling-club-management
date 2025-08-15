'use client';

import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import GameRecordModal from "@/components/GameRecordModal"; // 대시보드와 동일한 모달 사용
import {
    Calendar,
    Search,
    Target,
    TrendingUp,
    Trophy,
    Plus,
    X,
    Eye,
    Edit,
    Trash2,
    AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import type {
    GameScore,
    GetGameScoresParams,
    SortOption
} from "@/lib/types";

export default function GamesHistoryPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [games, setGames] = useState<GameScore[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
    const [sortOption, setSortOption] = useState<SortOption>('date_desc');

    // 모달 상태 (기존 게임 추가 모달 제거, GameRecordModal만 사용)
    const [selectedGame, setSelectedGame] = useState<GameScore | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showGameRecordModal, setShowGameRecordModal] = useState(false);

    // 게임 데이터 로드
    const loadGames = async (page = 1) => {
        try {
            setLoading(true);

            const params: GetGameScoresParams = {
                page: page,
                limit: pagination.limit,
                sort: sortOption,
                filters: searchTerm ? {
                    clubName: searchTerm,
                    bowlingCenterName: searchTerm
                } : undefined
            };

            const response = await apiClient.getMyGameScores(params);

            // 백엔드 응답 구조에 맞춰 데이터 추출
            const gameScores = response.gameScores || response.data;
            const paginationData = response.pagination || {
                page: page,
                limit: 20,
                total: gameScores?.length || 0,
                totalPages: 1
            };

            if (Array.isArray(gameScores)) {
                setGames(gameScores);
                setPagination(paginationData);
            } else {
                setGames([]);
            }
        } catch (error) {
            console.error('게임 히스토리 로드 실패:', error);
            setGames([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGames();
    }, [sortOption]);

    // 페이지 변경
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            loadGames(newPage);
        }
    };

    // 정렬 변경
    const handleSortChange = (newSortBy: 'date' | 'score') => {
        setSortBy(newSortBy);
        const newSortOption: SortOption = newSortBy === 'date' ? 'date_desc' : 'score_desc';
        setSortOption(newSortOption);
    };

    // 검색 실행
    const handleSearch = () => {
        loadGames(1);
    };

    // 검색어 입력 시 엔터키 처리
    const handleSearchKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // 검색 필터링 (클라이언트 사이드)
    const filteredGames = games.filter(game => {
        if (!searchTerm) return true;

        const clubName = game.game?.club?.name?.toLowerCase() || '';
        const bowlingCenterName = game.game?.bowlingCenter?.name?.toLowerCase() || '';
        const searchLower = searchTerm.toLowerCase();

        return clubName.includes(searchLower) || bowlingCenterName.includes(searchLower);
    });

    // 통계 계산
    const stats = {
        totalGames: filteredGames.length,
        averageScore: filteredGames.length > 0
            ? Math.round(filteredGames.reduce((sum, game) => sum + game.score, 0) / filteredGames.length)
            : 0,
        highestScore: filteredGames.length > 0
            ? Math.max(...filteredGames.map(game => game.score))
            : 0,
        thisMonthGames: filteredGames.filter(game =>
            new Date(game.createdAt).getMonth() === new Date().getMonth() &&
            new Date(game.createdAt).getFullYear() === new Date().getFullYear()
        ).length
    };

    // 게임 추가 버튼 핸들러 (대시보드와 동일한 모달 사용)
    const handleAddGame = () => {
        setShowGameRecordModal(true);
    };

    // 게임 추가 완료 핸들러
    const handleGameAdded = () => {
        loadGames(); // 목록 새로고침
    };

    // 상세 보기 핸들러
    const handleViewDetail = (game: GameScore) => {
        setSelectedGame(game);
        setShowDetailModal(true);
    };

    // 수정 핸들러
    const handleEdit = (game: GameScore) => {
        router.push(`/games/edit/${game.id}`);
    };

    // 삭제 핸들러
    const handleDelete = (game: GameScore) => {
        setSelectedGame(game);
        setShowDeleteModal(true);
    };

    // 삭제 확인
    const confirmDelete = async () => {
        if (!selectedGame) return;

        try {
            await apiClient.deleteGameScore(selectedGame.id);
            setShowDeleteModal(false);
            setSelectedGame(null);
            loadGames(); // 새로고침
        } catch (error) {
            console.error('게임 삭제 실패:', error);
            alert('게임 삭제에 실패했습니다.');
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                    <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-8">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                        <p className="text-white text-center text-lg">게임 기록을 불러오고 있습니다...</p>
                    </div>
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
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                                        <Trophy className="w-8 h-8 text-amber-400" />
                                        게임 히스토리
                                    </h1>
                                    <p className="text-white/70">
                                        {user?.name}님의 모든 게임 기록을 확인하세요
                                    </p>
                                </div>
                                <button
                                    onClick={handleAddGame}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    게임 추가
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 통계 요약 카드 */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                    <Trophy className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-white/70 text-sm">총 게임</p>
                                    <p className="text-white text-2xl font-bold">{stats.totalGames}회</p>
                                </div>
                            </div>
                        </div>

                        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                    <Target className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-white/70 text-sm">평균 점수</p>
                                    <p className="text-white text-2xl font-bold">{stats.averageScore}점</p>
                                </div>
                            </div>
                        </div>

                        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-white/70 text-sm">최고 점수</p>
                                    <p className="text-white text-2xl font-bold">{stats.highestScore}점</p>
                                </div>
                            </div>
                        </div>

                        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-white/70 text-sm">이번 달</p>
                                    <p className="text-white text-2xl font-bold">{stats.thisMonthGames}회</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 필터 및 검색 */}
                    <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6 mb-8">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="flex gap-4 items-center w-full md:w-auto">
                                <div className="relative flex-1 md:flex-none">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                                    <input
                                        type="text"
                                        placeholder="검색 (볼링장 이름, 클럽 이름)"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={handleSearchKeyPress}
                                        className="pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-80"
                                    />
                                </div>

                                <button
                                    onClick={handleSearch}
                                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                                >
                                    검색
                                </button>

                                <select
                                    value={sortBy}
                                    onChange={(e) => handleSortChange(e.target.value as 'date' | 'score')}
                                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="date" className="bg-gray-800">최신순</option>
                                    <option value="score" className="bg-gray-800">점수순</option>
                                </select>
                            </div>

                            <div className="text-white/70 text-sm">
                                총 {filteredGames.length}개의 게임 기록
                            </div>
                        </div>
                    </div>

                    {/* 게임 기록 테이블 */}
                    <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 overflow-hidden">
                        {filteredGames.length === 0 ? (
                            /* 빈 상태 */
                            <div className="p-12 text-center">
                                <Trophy className="w-20 h-20 text-white/30 mx-auto mb-6" />
                                <h3 className="text-2xl font-semibold text-white mb-4">
                                    {searchTerm ? '검색 결과가 없습니다' : '게임 기록이 없습니다'}
                                </h3>
                                <p className="text-white/70 mb-8">
                                    {searchTerm ? '볼링장 이름이나 클럽 이름으로 다시 검색해보세요' : '첫 번째 게임을 기록해보세요!'}
                                </p>
                                <button
                                    onClick={handleAddGame}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors flex items-center gap-2 mx-auto"
                                >
                                    <Plus className="w-5 h-5" />
                                    게임 추가하기
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-white font-semibold">날짜</th>
                                        <th className="px-6 py-4 text-left text-white font-semibold">점수</th>
                                        <th className="px-6 py-4 text-left text-white font-semibold">게임 순서</th>
                                        <th className="px-6 py-4 text-left text-white font-semibold">클럽</th>
                                        <th className="px-6 py-4 text-left text-white font-semibold">볼링장</th>
                                        <th className="px-6 py-4 text-center text-white font-semibold">액션</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredGames.map((game) => (
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
                                                <span className={`text-xl font-bold px-3 py-1 rounded-lg ${
                                                    game.score >= 180 ? 'text-red-400 bg-red-500/20' :
                                                        game.score >= 150 ? 'text-emerald-400 bg-emerald-500/20' :
                                                            game.score >= 120 ? 'text-amber-400 bg-amber-500/20' :
                                                                'text-white bg-white/10'
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
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleViewDetail(game)}
                                                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
                                                        title="상세 보기"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(game)}
                                                        className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 rounded-lg transition-colors"
                                                        title="수정"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(game)}
                                                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                                                        title="삭제"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* 페이지네이션 */}
                        {pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 p-6 border-t border-white/10">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                                >
                                    이전
                                </button>

                                <span className="text-white/70 px-4">
                                    {pagination.page} / {pagination.totalPages}
                                </span>

                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                                >
                                    다음
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 기존 게임 추가 모달 제거 - 대신 GameRecordModal 사용 */}

                {/* 통합된 게임 기록 모달 (대시보드와 동일) */}
                <GameRecordModal
                    isOpen={showGameRecordModal}
                    onClose={() => setShowGameRecordModal(false)}
                    onGameAdded={handleGameAdded}
                />

                {/* 상세 보기 모달 */}
                {showDetailModal && selectedGame && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Trophy className="w-6 h-6 text-amber-400" />
                                    게임 상세 정보
                                </h2>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* 기본 정보 */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-white/70 text-sm">점수</p>
                                        <p className="text-white text-xl font-bold">{selectedGame.score}점</p>
                                    </div>
                                    <div>
                                        <p className="text-white/70 text-sm">게임 순서</p>
                                        <p className="text-white text-xl font-bold">{selectedGame.gameOrder}게임</p>
                                    </div>
                                    <div>
                                        <p className="text-white/70 text-sm">클럽</p>
                                        <p className="text-white">{selectedGame.game?.club?.name || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/70 text-sm">볼링장</p>
                                        <p className="text-white">{selectedGame.game?.bowlingCenter?.name || '-'}</p>
                                    </div>
                                </div>

                                {/* 날짜 */}
                                <div>
                                    <p className="text-white/70 text-sm">게임 날짜</p>
                                    <p className="text-white">
                                        {new Date(selectedGame.createdAt).toLocaleDateString('ko-KR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            weekday: 'long',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>

                                {/* 프레임별 점수 (더미 데이터) */}
                                <div>
                                    <p className="text-white/70 text-sm mb-3">프레임별 점수</p>
                                    <div className="grid grid-cols-10 gap-2">
                                        {Array.from({ length: 10 }, (_, i) => (
                                            <div key={i} className="bg-white/10 border border-white/20 rounded-lg p-2 text-center">
                                                <div className="text-white/70 text-xs">{i + 1}</div>
                                                <div className="text-white font-bold">
                                                    {Math.floor(selectedGame.score / 10) + Math.floor(Math.random() * 10)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 삭제 확인 모달 */}
                {showDeleteModal && selectedGame && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-8 max-w-md w-full">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-8 h-8 text-red-400" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">게임 기록 삭제</h2>
                                <p className="text-white/70 mb-6">
                                    {selectedGame.score}점 게임 기록을 정말 삭제하시겠습니까?<br />
                                    이 작업은 되돌릴 수 없습니다.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                    >
                                        삭제
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}