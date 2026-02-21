'use client'

import { z } from "zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiClient } from "@/lib/api";
import { Gamepad2, RotateCcw, Target, Trophy, Users, X } from "lucide-react";
import {
  calculateScores,
  createEmptyFrames,
  type FrameInput,
  type FrameResult,
  getAvailablePinsForSecondRoll,
  getAvailablePinsForTenthFrame,
  getCurrentInput,
  getTotalScore,
  isGameComplete,
} from "@/lib/bowlingScoreCalculator";

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

interface GameRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGameAdded: () => void;
}

type InputMode = 'simple' | 'detailed';

export default function GameRecordModal({ isOpen, onClose, onGameAdded }: GameRecordModalProps) {
  const [loading, setLoading] = useState(false);
  const [userClubs, setUserClubs] = useState<Club[]>([]);
  const [clubsLoading, setClubsLoading] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>('simple');
  const [frames, setFrames] = useState<FrameInput[]>(createEmptyFrames());
  const [frameResults, setFrameResults] = useState<FrameResult[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GameRecordForm>({
    resolver: zodResolver(gameRecordSchema),
    defaultValues: {
      score: 0,
      gameType: 'practice',
    },
  });

  const currentScore = watch('score');

  // 프레임 변경 시 점수 재계산
  useEffect(() => {
    const results = calculateScores(frames);
    setFrameResults(results);
    if (inputMode === 'detailed') {
      const total = getTotalScore(frames);
      if (total !== null) {
        setValue('score', total);
      }
    }
  }, [frames, inputMode, setValue]);

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
      const submitData: {
        clubId?: string;
        score: number;
        gameType?: string;
        frameRecords?: FrameResult[];
      } = { ...data };

      if (inputMode === 'detailed' && isGameComplete(frames)) {
        submitData.frameRecords = frameResults;
      }

      await apiClient.addGameRecord(submitData);
      handleReset();
      onGameAdded();
      onClose();
    } catch (error) {
      console.error('게임 기록 추가 실패:', error);
      alert('게임 기록 추가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = useCallback(() => {
    reset();
    setFrames(createEmptyFrames());
    setInputMode('simple');
  }, [reset]);

  const handleModeChange = (mode: InputMode) => {
    setInputMode(mode);
    if (mode === 'detailed') {
      setFrames(createEmptyFrames());
      setValue('score', 0);
    }
  };

  // 핀 선택 핸들러
  const handlePinSelect = (pins: number) => {
    const current = getCurrentInput(frames);
    if (!current) return;

    const newFrames = frames.map((f, i) => {
      if (i !== current.frameIndex) return f;
      const updated = { ...f };
      if (current.roll === 'first') updated.firstRoll = pins;
      else if (current.roll === 'second') updated.secondRoll = pins;
      else if (current.roll === 'third') updated.thirdRoll = pins;
      return updated;
    });

    setFrames(newFrames);
  };

  // 마지막 입력 되돌리기
  const handleUndo = () => {
    const newFrames = [...frames];
    // 마지막으로 입력된 투구 찾기
    for (let i = 9; i >= 0; i--) {
      const frame = newFrames[i];
      if (i === 9) {
        if (frame.thirdRoll !== null) {
          newFrames[i] = { ...frame, thirdRoll: null };
          setFrames(newFrames);
          return;
        }
        if (frame.secondRoll !== null) {
          newFrames[i] = { ...frame, secondRoll: null };
          setFrames(newFrames);
          return;
        }
      }
      if (frame.secondRoll !== null && i < 9) {
        newFrames[i] = { ...frame, secondRoll: null };
        setFrames(newFrames);
        return;
      }
      if (frame.firstRoll !== null) {
        newFrames[i] = { ...frame, firstRoll: null, secondRoll: null, thirdRoll: null };
        setFrames(newFrames);
        return;
      }
    }
  };

  // 현재 선택 가능한 핀 버튼 목록 계산
  const getAvailableButtons = (): number[] => {
    const current = getCurrentInput(frames);
    if (!current) return [];

    const frame = frames[current.frameIndex];

    if (current.frameIndex < 9) {
      // 1~9프레임
      if (current.roll === 'first') {
        return Array.from({ length: 11 }, (_, i) => i); // 0-10
      }
      return getAvailablePinsForSecondRoll(frame.firstRoll!);
    }

    // 10프레임
    if (current.roll === 'first') {
      return Array.from({ length: 11 }, (_, i) => i);
    }
    if (current.roll === 'second') {
      return getAvailablePinsForTenthFrame('second', frame.firstRoll, null);
    }
    return getAvailablePinsForTenthFrame('third', frame.firstRoll, frame.secondRoll);
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
  const currentInput = getCurrentInput(frames);
  const availableButtons = getAvailableButtons();
  const gameComplete = isGameComplete(frames);
  const totalScore = getTotalScore(frames);
  const hasAnyInput = frames.some(f => f.firstRoll !== null);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-6 sm:p-8 w-full shadow-2xl max-h-[90vh] overflow-y-auto ${
        inputMode === 'detailed' ? 'max-w-3xl' : 'max-w-lg'
      }`}>
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-500/20 backdrop-blur-xl rounded-2xl border border-blue-300/30">
              <Trophy className="h-6 w-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">게임 기록 추가</h2>
          </div>
          <button
            onClick={() => { handleReset(); onClose(); }}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            disabled={loading}
          >
            <X className="h-6 w-6 text-white/60" />
          </button>
        </div>

        {/* 입력 모드 선택 */}
        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={() => handleModeChange('simple')}
            className={`flex-1 py-3 px-4 rounded-2xl border transition-all duration-300 text-sm font-medium ${
              inputMode === 'simple'
                ? 'bg-blue-500/30 border-blue-400/50 text-blue-300'
                : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10'
            }`}
          >
            간편 입력
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('detailed')}
            className={`flex-1 py-3 px-4 rounded-2xl border transition-all duration-300 text-sm font-medium ${
              inputMode === 'detailed'
                ? 'bg-blue-500/30 border-blue-400/50 text-blue-300'
                : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10'
            }`}
          >
            프레임별 상세 입력
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {inputMode === 'simple' ? (
            /* === 간편 입력 모드 === */
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
          ) : (
            /* === 프레임별 상세 입력 모드 === */
            <div className="space-y-4">
              {/* 스코어카드 */}
              <div className="overflow-x-auto">
                <div className="flex gap-1 min-w-[600px]">
                  {frameResults.map((result, i) => {
                    const isCurrentFrame = currentInput?.frameIndex === i;
                    const isTenthFrame = i === 9;

                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-xl border transition-all ${
                          isCurrentFrame
                            ? 'border-blue-400/60 bg-blue-500/20'
                            : 'border-white/20 bg-white/5'
                        } ${isTenthFrame ? 'min-w-[80px]' : 'min-w-[52px]'}`}
                      >
                        {/* 프레임 번호 */}
                        <div className="text-center text-white/50 text-xs py-1 border-b border-white/10">
                          {i + 1}
                        </div>

                        {/* 투구 결과 */}
                        <div className={`flex justify-center gap-0.5 px-1 py-1 border-b border-white/10 ${
                          isTenthFrame ? 'min-h-[28px]' : 'min-h-[28px]'
                        }`}>
                          <span className={`text-xs font-bold w-5 text-center ${
                            result.firstRoll === 'X' ? 'text-red-400' : 'text-white/80'
                          }`}>
                            {result.firstRoll ?? ''}
                          </span>
                          <span className={`text-xs font-bold w-5 text-center ${
                            result.secondRoll === '/' ? 'text-green-400' :
                            result.secondRoll === 'X' ? 'text-red-400' : 'text-white/80'
                          }`}>
                            {result.secondRoll ?? ''}
                          </span>
                          {isTenthFrame && (
                            <span className={`text-xs font-bold w-5 text-center ${
                              result.thirdRoll === 'X' ? 'text-red-400' :
                              result.thirdRoll === '/' ? 'text-green-400' : 'text-white/80'
                            }`}>
                              {result.thirdRoll ?? ''}
                            </span>
                          )}
                        </div>

                        {/* 누적 점수 */}
                        <div className="text-center py-1.5">
                          <span className="text-sm font-bold text-white">
                            {result.runningTotal ?? ''}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 총점 표시 */}
              <div className="text-center">
                <span className="text-white/60 text-sm">총점: </span>
                <span className={`text-2xl font-bold ${
                  totalScore !== null && totalScore >= 200 ? 'text-yellow-400' :
                  totalScore !== null && totalScore >= 150 ? 'text-green-400' :
                  'text-white'
                }`}>
                  {totalScore ?? '-'}
                </span>
                {totalScore !== null && totalScore > 0 && (
                  <span className={`text-sm font-medium ml-2 ${getScoreGrade(totalScore).color}`}>
                    {getScoreGrade(totalScore).text}
                  </span>
                )}
              </div>

              {/* 핀 선택 버튼 */}
              {!gameComplete ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-white/70 text-sm">
                      {currentInput
                        ? `${currentInput.frameIndex + 1}프레임 ${
                            currentInput.roll === 'first' ? '1투' :
                            currentInput.roll === 'second' ? '2투' : '3투'
                          }`
                        : '입력 완료'
                      }
                    </p>
                    {hasAnyInput && (
                      <button
                        type="button"
                        onClick={handleUndo}
                        className="flex items-center gap-1 text-white/50 hover:text-white/80 text-sm transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        되돌리기
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center">
                    {availableButtons.map((pins) => {
                      const isStrike = pins === 10 && (
                        currentInput?.roll === 'first' ||
                        (currentInput?.frameIndex === 9 && (currentInput?.roll === 'second' || currentInput?.roll === 'third'))
                      );
                      const isSpare = currentInput?.roll === 'second' && currentInput.frameIndex < 9 &&
                        frames[currentInput.frameIndex].firstRoll !== null &&
                        frames[currentInput.frameIndex].firstRoll! + pins === 10;

                      return (
                        <button
                          key={pins}
                          type="button"
                          onClick={() => handlePinSelect(pins)}
                          className={`w-12 h-12 rounded-xl font-bold text-lg transition-all duration-200 border ${
                            isStrike
                              ? 'bg-red-500/30 border-red-400/50 text-red-300 hover:bg-red-500/50'
                              : isSpare
                              ? 'bg-green-500/30 border-green-400/50 text-green-300 hover:bg-green-500/50'
                              : pins === 0
                              ? 'bg-white/5 border-white/20 text-white/50 hover:bg-white/15'
                              : 'bg-white/10 border-white/20 text-white hover:bg-white/25'
                          }`}
                        >
                          {isStrike ? 'X' : isSpare ? '/' : pins === 0 ? '-' : pins}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-green-400 font-medium">모든 프레임 입력 완료!</p>
                </div>
              )}

              {/* 전체 초기화 */}
              {hasAnyInput && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setFrames(createEmptyFrames())}
                    className="text-white/40 hover:text-white/70 text-sm transition-colors"
                  >
                    전체 초기화
                  </button>
                </div>
              )}

              {/* hidden score input for form */}
              <input type="hidden" {...register('score', { valueAsNumber: true })} />
            </div>
          )}

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
              onClick={() => { handleReset(); onClose(); }}
              className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 text-white py-3 px-4 rounded-2xl hover:bg-white/20 transition-all duration-300"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-4 rounded-2xl hover:from-blue-700 hover:to-blue-600 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || (inputMode === 'detailed' && !gameComplete)}
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
            {inputMode === 'simple'
              ? '총점만 빠르게 기록하세요.'
              : '각 프레임의 핀 수를 순서대로 선택하세요.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
