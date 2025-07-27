// backend/src/game/game.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGameDto } from './dto/create-game.dto';
import { CreateGameScoreDto } from './dto/create-game-score.dto';
import { UserStatsDto } from './dto/user-stats.dto';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  // 게임 생성 (클럽 단위)
  async createGame(userId: string, createGameDto: CreateGameDto) {
    // 사용자가 해당 클럽의 멤버인지 확인
    const membership = await this.prisma.clubMember.findFirst({
      where: {
        userId,
        clubId: createGameDto.clubId,
        isActive: true,
      },
    });

    if (!membership) {
      throw new ForbiddenException('해당 클럽의 멤버가 아닙니다.');
    }

    return this.prisma.game.create({
      data: {
        ...createGameDto,
        gameDate: new Date(createGameDto.gameDate),
      },
      include: {
        club: {
          select: { id: true, name: true },
        },
        bowlingCenter: {
          select: { id: true, name: true, address: true },
        },
      },
    });
  }

  // 게임 점수 추가
  async addGameScore(userId: string, createGameScoreDto: CreateGameScoreDto) {
    // 게임이 존재하는지 확인
    const game = await this.prisma.game.findUnique({
      where: { id: createGameScoreDto.gameId },
      include: { club: true },
    });

    if (!game) {
      throw new NotFoundException('게임을 찾을 수 없습니다.');
    }

    // 사용자가 해당 클럽의 멤버인지 확인
    const membership = await this.prisma.clubMember.findFirst({
      where: {
        userId,
        clubId: game.clubId,
        isActive: true,
      },
    });

    if (!membership) {
      throw new ForbiddenException('해당 클럽의 멤버가 아닙니다.');
    }

    return this.prisma.gameScore.create({
      data: {
        ...createGameScoreDto,
        userId,
      },
      include: {
        game: {
          include: {
            club: { select: { name: true } },
            bowlingCenter: { select: { name: true } },
          },
        },
      },
    });
  }

  // 사용자 게임 통계 조회
  async getUserStats(userId: string): Promise<UserStatsDto> {
    const gameScores = await this.prisma.gameScore.findMany({
      where: { userId },
      include: {
        game: {
          include: {
            club: { select: { name: true } },
            bowlingCenter: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (gameScores.length === 0) {
      return {
        totalGames: 0,
        averageScore: 0,
        bestScore: 0,
        worstScore: 0,
        totalScoreSum: 0,
        recentGames: [],
        monthlyStats: [],
      };
    }

    const totalGames = gameScores.length;
    const totalScoreSum = gameScores.reduce(
      (sum, score) => sum + score.score,
      0,
    );
    const averageScore = Math.round(totalScoreSum / totalGames);
    const bestScore = Math.max(...gameScores.map((score) => score.score));
    const worstScore = Math.min(...gameScores.map((score) => score.score));

    // 최근 5게임
    const recentGames = gameScores.slice(0, 5).map((score) => ({
      id: score.id,
      score: score.score,
      gameOrder: score.gameOrder,
      gameDate: score.game.gameDate.toISOString(),
      gameType: score.game.gameType,
      club: {
        name: score.game.club.name,
      },
      bowlingCenter: {
        name: score.game.bowlingCenter.name,
      },
    }));

    // 월별 통계 (최근 6개월)
    const monthlyData = new Map<string, { count: number; sum: number }>();

    gameScores.forEach((score) => {
      const month = score.game.gameDate.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyData.has(month)) {
        monthlyData.set(month, { count: 0, sum: 0 });
      }
      const data = monthlyData.get(month)!;
      data.count++;
      data.sum += score.score;
    });

    const monthlyStats = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        gameCount: data.count,
        averageScore: Math.round(data.sum / data.count),
      }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 6);

    return {
      totalGames,
      averageScore,
      bestScore,
      worstScore,
      totalScoreSum,
      recentGames,
      monthlyStats,
    };
  }

  // 사용자의 게임 점수 목록 조회
  async getUserGameScores(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [gameScores, total] = await Promise.all([
      this.prisma.gameScore.findMany({
        where: { userId },
        include: {
          game: {
            include: {
              club: { select: { id: true, name: true } },
              bowlingCenter: {
                select: { id: true, name: true, address: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.gameScore.count({ where: { userId } }),
    ]);

    return {
      gameScores,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 클럽별 게임 목록 조회
  async getClubGames(clubId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [games, total] = await Promise.all([
      this.prisma.game.findMany({
        where: { clubId },
        include: {
          bowlingCenter: { select: { id: true, name: true, address: true } },
          scores: {
            include: {
              user: { select: { id: true, name: true } },
            },
            orderBy: { score: 'desc' },
          },
        },
        orderBy: { gameDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.game.count({ where: { clubId } }),
    ]);

    return {
      games,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 특정 게임의 점수 조회
  async getGameScores(gameId: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: {
        club: { select: { name: true } },
        bowlingCenter: { select: { name: true, address: true } },
        scores: {
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { score: 'desc' },
        },
      },
    });

    if (!game) {
      throw new NotFoundException('게임을 찾을 수 없습니다.');
    }

    return game;
  }

  // 게임 점수 수정
  async updateGameScore(userId: string, scoreId: string, score: number) {
    const gameScore = await this.prisma.gameScore.findUnique({
      where: { id: scoreId },
    });

    if (!gameScore) {
      throw new NotFoundException('게임 점수를 찾을 수 없습니다.');
    }

    if (gameScore.userId !== userId) {
      throw new ForbiddenException('이 점수를 수정할 권한이 없습니다.');
    }

    return this.prisma.gameScore.update({
      where: { id: scoreId },
      data: { score },
      include: {
        game: {
          include: {
            club: { select: { name: true } },
            bowlingCenter: { select: { name: true } },
          },
        },
      },
    });
  }

  // 게임 점수 삭제
  async deleteGameScore(userId: string, scoreId: string) {
    const gameScore = await this.prisma.gameScore.findUnique({
      where: { id: scoreId },
    });

    if (!gameScore) {
      throw new NotFoundException('게임 점수를 찾을 수 없습니다.');
    }

    if (gameScore.userId !== userId) {
      throw new ForbiddenException('이 점수를 삭제할 권한이 없습니다.');
    }

    return this.prisma.gameScore.delete({
      where: { id: scoreId },
    });
  }
}
