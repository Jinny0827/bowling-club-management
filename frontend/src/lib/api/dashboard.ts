// src/lib/api/dashboard.ts
import { BaseApiClient } from './base';

export class DashboardApi extends BaseApiClient {
    // 대시보드 통계 조회
    async getDashboardStats() {
        try {
            const response = await this.client.get('/api/dashboard/stats');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // 사용자 클럽 목록 조회 (GameRecordModal 호환)
    async getUserClubs() {
        try {
            const response = await this.client.get('/api/dashboard/clubs');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // 게임 기록 추가 (GameRecordModal 호환)
    async addGameRecord(gameData: {
        clubId?: string;
        score: number;
        gameType?: string;
    }) {
        try {
            const response = await this.client.post('/api/dashboard/game', gameData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }
}