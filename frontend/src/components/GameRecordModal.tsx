'use client'

import {z} from "zod";
import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {apiClient} from "@/lib/api";
import {Gamepad2, Target, Trophy, Users, X} from "lucide-react";


const gameRecordSchema = z.object({
  score: z.number().min(0).max(300),
  clubId: z.string().optional(),
  gameType: z.string().optional(),
})

type GameRecordForm = z.infer<typeof gameRecordSchema>;

interface Club {
  club: {
    id: string;
    name: string;
  };
}

interface GameRecordModalProps  {
  isOpen: boolean;
  onClose: () => void;
  onGameAdded: () => void;
}

export default function GameRecordModal({ isOpen, onClose, onGameAdded }: GameRecordModalProps) {
  const [loading, setLoading] = useState(false);
  const [userClubs, setUserClubs] = useState<Club[]>([]);
  const [clubsLoading, setClubsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<GameRecordForm>({
    resolver: zodResolver(gameRecordSchema),
    defaultValues: {
      score: 0,
      gameType: 'practice',
    },
  });

  const currentScore = watch('score');

  useEffect(() => {
    if (isOpen) {
      fetchUserClubs();
    }
  }, [isOpen]);

  const fetchUserClubs = async () => {
    setClubsLoading(true);
    try {
      const response = await apiClient.getUserClubs();
      setUserClubs(response);
    } catch (error) {
      console.error('클럽 목록을 불러오는데 실패했습니다:', error);
    } finally {
      setClubsLoading(false);
    }
  };

  const onSubmit = async (data: GameRecordForm) => {
    setLoading(true);
    try {
      await apiClient.addGameRecord(data);
      reset();
      onGameAdded();
      onClose();
    } catch (error) {
      console.error('게임 기록 추가 실패:', error);
      alert('게임 기록 추가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreGrade = (score: number) => {
    if (score >= 200) return { text: '완벽!', color: 'text-yellow-400' };
    if (score >= 150) return { text: '훌륭해요!', color: 'text-green-400' };
    if (score >= 100) return { text: '좋아요!', color: 'text-blue-400' };
    if (score >= 50) return { text: '괜찮아요!', color: 'text-purple-400' };
    return { text: '시작이 반!', color: 'text-gray-400' };
  };

  if (!isOpen) return null;

  const scoreGrade = getScoreGrade(currentScore);

  return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-8 w-full max-w-lg shadow-2xl">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-500/20 backdrop-blur-xl rounded-2xl border border-blue-300/30">
                <Trophy className="h-6 w-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">게임 기록 추가</h2>
            </div>
            <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                disabled={loading}
            >
              <X className="h-6 w-6 text-white/60" />
            </button>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 점수 입력 */}
            <div>
              <label className="block text-white font-medium mb-2">
                점수 *
              </label>
              <div className="relative">
                <input
                    type="number"
                    {...register('score', { valueAsNumber: true })}
                    className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all text-xl font-bold text-center"
                    placeholder="0-300"
                    min="0"
                    max="300"
                />
                <Target className="absolute right-3 top-3 h-6 w-6 text-white/40" />
              </div>

              {/* 점수 평가 */}
              {currentScore > 0 && (
                  <div className="mt-2 text-center">
                <span className={`text-sm font-medium ${scoreGrade.color}`}>
                  {scoreGrade.text}
                </span>
                  </div>
              )}

              {errors.score && (
                  <p className="text-red-400 text-sm mt-1">{errors.score.message}</p>
              )}
            </div>

            {/* 게임 타입 */}
            <div>
              <label className="block text-white font-medium mb-2">
                게임 타입
              </label>
              <div className="relative">
                <select
                    {...register('gameType')}
                    className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all appearance-none"
                >
                  <option value="practice" className="bg-slate-800">개인 연습</option>
                  <option value="league" className="bg-slate-800">리그전</option>
                  <option value="tournament" className="bg-slate-800">토너먼트</option>
                  <option value="casual" className="bg-slate-800">자유 게임</option>
                </select>
                <Gamepad2 className="absolute right-3 top-3 h-6 w-6 text-white/40 pointer-events-none" />
              </div>
            </div>

            {/* 클럽 선택 */}
            <div>
              <label className="block text-white font-medium mb-2">
                클럽 (선택사항)
              </label>
              <div className="relative">
                <select
                    {...register('clubId')}
                    className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all appearance-none"
                    disabled={clubsLoading}
                >
                  <option value="">개인 연습</option>
                  {userClubs.map((membership) => (
                      <option key={membership.club.id} value={membership.club.id} className="bg-slate-800">
                        {membership.club.name}
                      </option>
                  ))}
                </select>
                <Users className="absolute right-3 top-3 h-6 w-6 text-white/40 pointer-events-none" />

                {clubsLoading && (
                    <div className="absolute inset-0 bg-white/5 rounded-2xl flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/60"></div>
                    </div>
                )}
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex space-x-4 pt-4">
              <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 text-white py-3 px-4 rounded-2xl hover:bg-white/20 transition-all duration-300"
                  disabled={loading}
              >
                취소
              </button>
              <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-4 rounded-2xl hover:from-blue-700 hover:to-blue-600 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
              >
                {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>저장 중...</span>
                    </div>
                ) : (
                    '게임 기록 저장'
                )}
              </button>
            </div>
          </form>

          {/* 팁 */}
          <div className="mt-6 p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
            <p className="text-white/60 text-sm text-center">
              💡 <strong className="text-white/80">팁:</strong> 정확한 점수를 입력하면 더 나은 통계를 확인할 수 있어요!
            </p>
          </div>
        </div>
      </div>
  );
}