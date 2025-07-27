import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  ParseUUIDPipe,
  HttpStatus,
  HttpException,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { CreateGameScoreDto } from './dto/create-game-score.dto';

@Controller('api/games')
@UseGuards(JwtAuthGuard)
export class GameController {
  constructor(private readonly gameService: GameService) {}

  // 게임 생성 (클럽 단위)
  @Post()
  async createGame(@Request() req: any, @Body() createGameDto: CreateGameDto) {
    try {
      console.log('🔥 게임 생성 요청:', req.user.id, createGameDto);

      const result = await this.gameService.createGame(
        req.user.id,
        createGameDto,
      );

      return {
        success: true,
        message: '게임이 생성되었습니다.',
        data: result,
      };
    } catch (error) {
      console.error('🔥 게임 생성 에러:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: '게임 생성 중 오류가 발생했습니다.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 게임 점수 추가
  @Post('scores')
  async addGameScore(
    @Request() req: any,
    @Body() createGameScoreDto: CreateGameScoreDto,
  ) {
    try {
      const result = await this.gameService.addGameScore(
        req.user.id,
        createGameScoreDto,
      );

      return {
        success: true,
        message: '게임 점수가 추가되었습니다.',
        data: result,
      };
    } catch (error) {
      console.error('🔥 게임 점수 추가 에러:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: '게임 점수 추가 중 오류가 발생했습니다.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('my-stats')
  async getMyStats(@Request() req: any) {
    try {
      console.log('🔥 게임 통계 조회 요청:', req.user.id);

      const result = await this.gameService.getUserStats(req.user.id);

      return {
        success: true,
        message: '게임 통계 조회가 완료되었습니다.',
        data: result,
      };
    } catch (error: any) {
      console.error('🔥 게임 통계 조회 에러:', error);

      throw new HttpException(
        {
          success: false,
          message: '게임 통계 조회 중 오류가 발생했습니다.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 내 게임 점수 목록 조회
  @Get('my-scores')
  async getMyGameScores(
    @Request() req: any,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    try {
      console.log('🔥 게임 점수 목록 조회 요청:', req.user.id, { page, limit });

      const result = await this.gameService.getUserGameScores(
        req.user.id,
        page,
        limit,
      );

      return {
        success: true,
        message: '게임 점수 목록 조회가 완료되었습니다.',
        data: result,
      };
    } catch (error: any) {
      console.error('🔥 게임 점수 목록 조회 에러:', error);

      throw new HttpException(
        {
          success: false,
          message: '게임 점수 목록 조회 중 오류가 발생했습니다.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 특정 게임의 점수들 조회
  @Get(':gameId/scores')
  async getGameScores(@Param('gameId', ParseUUIDPipe) gameId: string) {
    try {
      console.log('🔥 게임 점수 상세 조회 요청:', gameId);

      const result = await this.gameService.getGameScores(gameId);

      return {
        success: true,
        message: '게임 점수 상세 조회가 완료되었습니다.',
        data: result,
      };
    } catch (error: any) {
      console.error('🔥 게임 점수 상세 조회 에러:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: '게임 점수 상세 조회 중 오류가 발생했습니다.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 클럽별 게임 목록 조회
  @Get('club/:clubId')
  async getClubGames(
    @Param('clubId', ParseUUIDPipe) clubId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    try {
      console.log('🔥 클럽 게임 목록 조회 요청:', clubId, { page, limit });

      const result = await this.gameService.getClubGames(clubId, page, limit);

      return {
        success: true,
        message: '클럽 게임 목록 조회가 완료되었습니다.',
        data: result,
      };
    } catch (error: any) {
      console.error('🔥 클럽 게임 목록 조회 에러:', error);

      throw new HttpException(
        {
          success: false,
          message: '클럽 게임 목록 조회 중 오류가 발생했습니다.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 게임 점수 수정
  @Patch('scores/:scoreId')
  async updateGameScore(
    @Request() req: any,
    @Param('scoreId', ParseUUIDPipe) scoreId: string,
    @Body('score', ParseIntPipe) score: number,
  ) {
    try {
      console.log('🔥 게임 점수 수정 요청:', req.user.id, scoreId, score);

      const result = await this.gameService.updateGameScore(
        req.user.id,
        scoreId,
        score,
      );

      return {
        success: true,
        message: '게임 점수가 수정되었습니다.',
        data: result,
      };
    } catch (error: any) {
      console.error('🔥 게임 점수 수정 에러:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: '게임 점수 수정 중 오류가 발생했습니다.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 게임 점수 삭제
  @Delete('scores/:scoreId')
  async deleteGameScore(
    @Request() req: any,
    @Param('scoreId', ParseUUIDPipe) scoreId: string,
  ) {
    try {
      console.log('🔥 게임 점수 삭제 요청:', req.user.id, scoreId);

      await this.gameService.deleteGameScore(req.user.id, scoreId);

      return {
        success: true,
        message: '게임 점수가 삭제되었습니다.',
      };
    } catch (error: any) {
      console.error('🔥 게임 점수 삭제 에러:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: '게임 점수 삭제 중 오류가 발생했습니다.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
