// backend/src/dashboard/dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface DashboardStats {
  totalGames: number;
  averageScore: number;
  highestScore: number;
  recentGames: any[];
  clubActivities: any[];
  clubMemberships: any[];
}

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getUserDashboard(userId: string): Promise<DashboardStats> {
    try {
      // 사용자가 참여한 게임 점수들
      const userGameScores = await this.prisma.gameScore.findMany({
        where: { userId },
        include: {
          game: {
            include: {
              club: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const totalGames = userGameScores.length;

      // 🔧 평균 점수 계산 추가
      const averageScore =
        totalGames > 0
          ? Math.round(
              userGameScores.reduce((sum, score) => sum + score.score, 0) /
                totalGames,
            )
          : 0;

      // 최고 점수 계산
      const highestScore =
        totalGames > 0
          ? Math.max(...userGameScores.map((score) => score.score))
          : 0;

      // 🔧 최근 게임 기록 - const 추가
      const recentGames = userGameScores.slice(0, 5).map((score) => ({
        id: score.id,
        totalScore: score.score,
        gameDate: score.game.gameDate,
        clubName: score.game.club?.name || '개인 연습',
        gameOrder: score.gameOrder,
      }));

      // 🔧 사용자의 클럽 멤버십 - const 추가
      const clubMemberships = await this.prisma.clubMember.findMany({
        where: {
          userId,
          isActive: true,
        },
        include: {
          club: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      });

      // 클럽 활동 (최근 활동들)
      const clubActivities = await this.getRecentClubActivities(userId);

      return {
        totalGames,
        averageScore,
        highestScore,
        recentGames,
        clubActivities,
        clubMemberships: clubMemberships.map((membership) => ({
          clubId: membership.club.id,
          clubName: membership.club.name,
          role: membership.role,
          joinedDate: membership.joinedDate,
        })),
      };
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      // 에러 시 기본값 반환
      return {
        totalGames: 0,
        averageScore: 0,
        highestScore: 0,
        recentGames: [],
        clubActivities: [],
        clubMemberships: [],
      };
    }
  }

  private async getRecentClubActivities(userId: string) {
    try {
      // 사용자가 속한 클럽들
      const userClubs = await this.prisma.clubMember.findMany({
        where: { userId, isActive: true },
        include: {
          club: true,
        },
      });

      const activities: any[] = [];

      for (const membership of userClubs) {
        // 클럽의 최근 게임들
        const recentClubGames = await this.prisma.game.findMany({
          where: { clubId: membership.clubId },
          orderBy: { gameDate: 'desc' },
          take: 3,
          include: {
            scores: {
              include: {
                user: { select: { name: true } },
              },
              orderBy: { score: 'desc' },
              take: 1, // 각 게임의 최고 점수만
            },
          },
        });

        for (const game of recentClubGames) {
          // 🔧 game.score → game.scores 수정
          if (game.scores && game.scores.length > 0) {
            const topScore = game.scores[0];
            activities.push({
              type: 'game',
              title: `${topScore.user.name}님이 ${topScore.score}점을 기록했습니다`,
              description: `${membership.club.name} 클럽`,
              time: game.gameDate,
              icon: 'trophy',
            });
          }
        }

        // 새로운 멤버 가입 (최근 일주일)
        const newMembers = await this.prisma.clubMember.findMany({
          where: {
            clubId: membership.clubId,
            joinedDate: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
          include: {
            user: { select: { name: true } },
          },
          orderBy: { joinedDate: 'desc' },
          take: 3,
        });

        for (const member of newMembers) {
          activities.push({
            type: 'member',
            title: `${member.user.name}님이 클럽에 가입했습니다`,
            description: `${membership.club.name} 클럽`,
            time: member.joinedDate,
            icon: 'user-plus',
          });
        }
      }

      // 시간순 정렬하여 최근 10개만 반환
      return activities
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 10);
    } catch (error) {
      console.error('Club activities fetch error:', error);
      return [];
    }
  }

  async addGameRecord(
    userId: string,
    gameData: {
      clubId?: string;
      score: number;
      gameType?: string;
      bowlingCenterId?: string;
    },
  ) {
    try {
      // 🔧 실제 존재하는 볼링센터와 클럽을 찾거나 생성해야 함
      // 일단 임시로 첫 번째 볼링센터와 클럽을 사용

      // 기본 볼링센터 찾기
      let bowlingCenter = await this.prisma.bowlingCenter.findFirst();
      if (!bowlingCenter) {
        // 볼링센터가 없으면 기본 센터 생성
        bowlingCenter = await this.prisma.bowlingCenter.create({
          data: {
            name: '기본 볼링센터',
            address: '서울시 강남구',
            laneCount: 20,
            parkingAvailable: true,
          },
        });
      }

      // 기본 클럽 찾기 (개인 연습용)
      let defaultClub = await this.prisma.club.findFirst({
        where: {
          name: '개인 연습',
        },
      });

      if (!defaultClub) {
        // 개인 연습용 클럽이 없으면 생성
        defaultClub = await this.prisma.club.create({
          data: {
            name: '개인 연습',
            bowlingCenterId: bowlingCenter.id,
            description: '개인 연습용 클럽',
            clubFee: 0,
          },
        });
      }

      return await this.prisma.$transaction(async (prisma) => {
        // 1. 게임 생성
        const game = await prisma.game.create({
          data: {
            clubId: gameData.clubId || defaultClub.id,
            bowlingCenterId: gameData.bowlingCenterId || bowlingCenter.id,
            gameDate: new Date(),
            gameType: gameData.gameType || 'practice',
          },
        });

        // 2. 게임 점수 기록
        const gameScore = await prisma.gameScore.create({
          data: {
            gameId: game.id,
            userId,
            score: gameData.score,
            gameOrder: 1, // 단일 게임의 경우
          },
          include: {
            game: {
              include: {
                club: { select: { name: true } },
              },
            },
          },
        });

        return gameScore;
      });
    } catch (error) {
      console.error('Add game record error:', error);
      throw new Error('게임 기록 추가에 실패했습니다.');
    }
  }

  async getUserClubs(userId: string) {
    try {
      return await this.prisma.clubMember.findMany({
        where: {
          userId,
          isActive: true,
        },
        include: {
          club: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Get user clubs error:', error);
      return [];
    }
  }
}
