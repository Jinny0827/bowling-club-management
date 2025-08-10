// src/lib/api/games.ts
import { BaseApiClient } from './base';
import {
    UserStats,
    GetGameScoresParams,
    GameScoreListResponse,
    CreateGameRequest,
    Game,
    CreateGameScoreRequest,
    GameScore,
    ApiResponse
} from '../types';

export class GamesApi extends BaseApiClient {
    // 내 게임 통계 조회
    async getMyGameStats(): Promise<UserStats> {
        try {
            const response = await this.client.get<ApiResponse<UserStats>>('/api/games/my-stats');
            return response.data.data!;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // 내 게임 점수 목록 조회 (페이지네이션 + 필터링)
    async getMyGameScores(params: GetGameScoresParams = {}): Promise<GameScoreListResponse> {
        try {
            const searchParams = new URLSearchParams();

            // 페이지네이션 파라미터
            if (params.page) searchParams.append('page', params.page.toString());
            if (params.limit) searchParams.append('limit', params.limit.toString());
            if (params.sort) searchParams.append('sort', params.sort);

            // 필터 파라미터
            if (params.filters?.clubName) {
                searchParams.append('clubName', params.filters.clubName);
            }
            if (params.filters?.bowlingCenterName) {
                searchParams.append('bowlingCenterName', params.filters.bowlingCenterName);
            }
            if (params.filters?.startDate) {
                searchParams.append('startDate', params.filters.startDate);
            }
            if (params.filters?.endDate) {
                searchParams.append('endDate', params.filters.endDate);
            }
            if (params.filters?.minScore) {
                searchParams.append('minScore', params.filters.minScore.toString());
            }
            if (params.filters?.maxScore) {
                searchParams.append('maxScore', params.filters.maxScore.toString());
            }

            const queryString = searchParams.toString();
            const url = `/api/games/my-scores${queryString ? `?${queryString}` : ''}`;

            const response = await this.client.get<ApiResponse<GameScoreListResponse>>(url);
            return response.data.data!;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // 게임 생성
    async createGame(data: CreateGameRequest): Promise<Game> {
        try {
            const response = await this.client.post<ApiResponse<Game>>('/api/games', data);
            return response.data.data!;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // 게임 점수 추가
    async addGameScores(data: CreateGameScoreRequest): Promise<GameScore[]> {
        try {
            const response = await this.client.post<ApiResponse<GameScore[]>>('/api/games/scores', data);
            return response.data.data!;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // 특정 게임 상세 조회
    async getGame(gameId: string): Promise<Game> {
        try {
            const response = await this.client.get<ApiResponse<Game>>(`/api/games/${gameId}`);
            return response.data.data!;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // 게임 점수 수정
    async updateGameScore(scoreId: string, score: number): Promise<GameScore> {
        try {
            const response = await this.client.patch<ApiResponse<GameScore>>(
                `/api/games/scores/${scoreId}`,
                { score }
            );
            return response.data.data!;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // 게임 점수 삭제
    async deleteGameScore(scoreId: string): Promise<void> {
        try {
            await this.client.delete(`/api/games/scores/${scoreId}`);
        } catch (error) {
            throw this.handleError(error);
        }
    }
}