export class UserStatsDto {
  totalGames: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  totalScoreSum: number;
  recentGames: Array<{
    id: string;
    score: number;
    gameOrder: number;
    gameDate: string;
    gameType?: string | null;
    club: {
      name: string;
    };
    bowlingCenter: {
      name: string;
    };
  }>;
  monthlyStats: Array<{
    month: string;
    gameCount: number;
    averageScore: number;
  }>;
}
