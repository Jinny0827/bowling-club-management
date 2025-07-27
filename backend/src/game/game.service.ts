import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGameDto } from './dto/create-game.dto';
import { CreateGameScoreDto } from './dto/create-game-score.dto';
import { UserStatsDto } from './dto/user-stats.dto';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  // 게임 생성(클럽 단위)
  async createGame(userId: string, createGameDto: CreateGameDto) {
    // 사용자가 해당 클럽 회원인지 확인
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
            bowlingCenter: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (gameScores.length === 0) {
      return {
        totalGames: 0,
        averageScore: 0,
        bestScore: 0,
        worstScore: 0,
        totalScoreSum: 0,
        recentGames: [],
        monthlyStats: []
      };
  }
}
