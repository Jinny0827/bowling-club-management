// backend/src/dashboard/dashboard.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

// 실제 JWT Strategy에서 반환하는 user 객체 타입
interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  phoneNumber: string | null;
  profileImageUrl: string | null;
  createdAt: Date;
}

// Express Request 확장
interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  // 🔧 인증 없는 테스트 엔드포인트
  @Get('ping')
  ping() {
    return {
      message: 'Dashboard controller is working!',
      timestamp: new Date(),
      server: 'NestJS',
      status: 'OK',
    };
  }

  // 🔧 인증 없는 POST 테스트
  @Post('echo')
  echo(@Body() data: any) {
    return {
      message: 'POST endpoint working!',
      receivedData: data,
      timestamp: new Date(),
    };
  }

  // 기존 인증 필요한 엔드포인트들
  @Get('stats')
  @UseGuards(JwtAuthGuard) // 🔧 개별적으로 가드 적용
  async getDashboardStats(@Req() req: AuthenticatedRequest) {
    if (!req.user?.id) {
      throw new HttpException(
        '사용자 정보를 찾을 수 없습니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return await this.dashboardService.getUserDashboard(req.user.id);
  }

  @Get('clubs')
  @UseGuards(JwtAuthGuard)
  async getUserClubs(@Req() req: AuthenticatedRequest) {
    if (!req.user?.id) {
      throw new HttpException(
        '사용자 정보를 찾을 수 없습니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return await this.dashboardService.getUserClubs(req.user.id);
  }

  @Post('game')
  @UseGuards(JwtAuthGuard)
  async addGame(
    @Req() req: AuthenticatedRequest,
    @Body()
    gameData: {
      clubId?: string;
      score: number;
      gameType?: string;
      frameRecords?: Array<{
        frameNumber: number;
        firstRoll: string | null;
        secondRoll: string | null;
        thirdRoll: string | null;
        frameScore: number | null;
        runningTotal: number | null;
        frameType: 'NORMAL' | 'SPARE' | 'STRIKE';
      }>;
    },
  ) {
    if (!req.user?.id) {
      throw new HttpException(
        '사용자 정보를 찾을 수 없습니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // 입력 데이터 검증
    if (
      gameData.score === null ||
      gameData.score === undefined ||
      gameData.score < 0 ||
      gameData.score > 300
    ) {
      throw new HttpException(
        '올바른 점수를 입력해주세요 (0-300)',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.dashboardService.addGameRecord(req.user.id, gameData);
  }
}
