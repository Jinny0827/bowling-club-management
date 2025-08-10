// src/lib/api/index.ts
import { AuthApi } from './auth';
import { GamesApi } from './games';
import { DashboardApi } from './dashboard';
import {
    LoginRequest,
    RegisterRequest,
    GetGameScoresParams,
    CreateGameRequest,
    CreateGameScoreRequest
} from '../types';

// 통합 API 클라이언트 클래스
class ApiClient {
    public auth: AuthApi;
    public games: GamesApi;
    public dashboard: DashboardApi;

    constructor() {
        this.auth = new AuthApi();
        this.games = new GamesApi();
        this.dashboard = new DashboardApi();
    }

    // 기존 호환성을 위한 메서드들 (기존 코드 수정 없이 사용 가능)

    // 인증 관련
    async register(data: RegisterRequest) {
        return this.auth.register(data);
    }

    async login(data: LoginRequest) {
        return this.auth.login(data);
    }

    async getCurrentUser() {
        return this.auth.getCurrentUser();
    }

    async getProfile() {
        return this.auth.getProfile();
    }

    logout() {
        return this.auth.logout();
    }

    isAuthenticated() {
        return this.auth.isAuthenticated();
    }

    // 게임 관련
    async getMyGameStats() {
        return this.games.getMyGameStats();
    }

    async getMyGameScores(params?: GetGameScoresParams) {
        return this.games.getMyGameScores(params);
    }

    async createGame(data: CreateGameRequest) {
        return this.games.createGame(data);
    }

    async addGameScores(data: CreateGameScoreRequest) {
        return this.games.addGameScores(data);
    }

    async getGame(gameId: string) {
        return this.games.getGame(gameId);
    }

    async updateGameScore(scoreId: string, score: number) {
        return this.games.updateGameScore(scoreId, score);
    }

    async deleteGameScore(scoreId: string) {
        return this.games.deleteGameScore(scoreId);
    }

    // 대시보드 관련
    async getDashboardStats() {
        return this.dashboard.getDashboardStats();
    }

    async getUserClubs() {
        return this.dashboard.getUserClubs();
    }

    async addGameRecord(gameData: {
        clubId?: string;
        score: number;
        gameType?: string;
    }) {
        return this.dashboard.addGameRecord(gameData);
    }
}

// 싱글톤 인스턴스 생성 및 export
export const apiClient = new ApiClient();

// 개별 API 클래스들도 export (필요시 직접 사용 가능)
export { AuthApi, GamesApi, DashboardApi };