import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // DB 연결 상태 확인 엔드포인트
  @Get('health')
  async getHealth() {
    const dbConnected = await this.prisma.healthCheck();

    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: {
        connected: dbConnected,
        status: dbConnected ? 'healthy' : 'unhealthy',
      },
    };
  }

  // 간단한 DB 쿼리 테스트
  @Get('db-test')
  async testDatabase() {
    try {
      // 볼링장 개수 조회로 DB 연결 테스트
      const bowlingCentersCount = await this.prisma.bowlingCenter.count();
      const clubsCount = await this.prisma.club.count();
      const usersCount = await this.prisma.user.count();

      return {
        message: 'Database connection successful',
        data: {
          bowlingCenters: bowlingCentersCount,
          clubs: clubsCount,
          users: usersCount,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        message: 'Database connection failed',
        error: errorMessage,
      };
    }
  }
}
