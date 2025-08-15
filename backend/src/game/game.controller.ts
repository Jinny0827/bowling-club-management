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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { CreateGameScoreDto } from './dto/create-game-score.dto';

@ApiTags('Games') // ← 🔥 추가: Swagger 태그
@Controller('games') // ← 🔥 수정:
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth') // ← 🔥 추가: 모든 API에 JWT 인증 필요 표시
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @ApiOperation({
    summary: '게임 생성',
    description: '새로운 볼링 게임을 생성합니다.',
  })
  @ApiBody({ type: CreateGameDto })
  @ApiResponse({
    status: 201,
    description: '게임 생성 성공',
    schema: {
      example: {
        success: true,
        message: '게임이 생성되었습니다.',
        data: {
          id: 'game-uuid',
          clubId: 'club-uuid',
          gameDate: '2025-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
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

  @ApiOperation({
    summary: '게임 점수 추가',
    description: '기존 게임에 새로운 점수를 추가합니다.',
  })
  @ApiBody({ type: CreateGameScoreDto })
  @ApiResponse({
    status: 201,
    description: '게임 점수 추가 성공',
    schema: {
      example: {
        success: true,
        message: '게임 점수가 추가되었습니다.',
        data: {
          id: 'score-uuid',
          gameId: 'game-uuid',
          frameNumber: 1,
          score: 85,
        },
      },
    },
  })
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

  @ApiOperation({
    summary: '내 게임 통계 조회',
    description: '현재 사용자의 게임 통계 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '게임 통계 조회 성공',
    schema: {
      example: {
        success: true,
        message: '게임 통계 조회가 완료되었습니다.',
        data: {
          totalGames: 25,
          averageScore: 142.5,
          bestScore: 187,
          strikeRate: 23.5,
        },
      },
    },
  })
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

  @ApiOperation({
    summary: '내 게임 점수 목록 조회',
    description: '현재 사용자의 게임 점수 목록을 페이지네이션으로 조회합니다.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '페이지 번호',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '페이지당 항목 수',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: '게임 점수 목록 조회 성공',
    schema: {
      example: {
        success: true,
        message: '게임 점수 목록 조회가 완료되었습니다.',
        data: {
          scores: [
            {
              id: 'score-uuid',
              score: 156,
              gameDate: '2025-01-01T00:00:00.000Z',
              frameNumber: 10,
            },
          ],
          total: 25,
          page: 1,
          limit: 20,
        },
      },
    },
  })
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

  @ApiOperation({
    summary: '특정 게임의 점수 조회',
    description: '게임 ID로 해당 게임의 모든 점수를 조회합니다.',
  })
  @ApiParam({ name: 'gameId', description: '게임 UUID', example: 'game-uuid' })
  @ApiResponse({
    status: 200,
    description: '게임 점수 상세 조회 성공',
  })
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

  @ApiOperation({
    summary: '클럽별 게임 목록 조회',
    description: '특정 클럽의 게임 목록을 페이지네이션으로 조회합니다.',
  })
  @ApiParam({ name: 'clubId', description: '클럽 UUID', example: 'club-uuid' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '페이지 번호',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '페이지당 항목 수',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: '클럽 게임 목록 조회 성공',
  })
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

  @ApiOperation({
    summary: '게임 점수 수정',
    description: '기존 게임 점수를 수정합니다.',
  })
  @ApiParam({
    name: 'scoreId',
    description: '점수 UUID',
    example: 'score-uuid',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        score: { type: 'number', example: 150, description: '수정할 점수' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '게임 점수 수정 성공',
  })
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

  @ApiOperation({
    summary: '게임 점수 삭제',
    description: '게임 점수를 삭제합니다.',
  })
  @ApiParam({
    name: 'scoreId',
    description: '점수 UUID',
    example: 'score-uuid',
  })
  @ApiResponse({
    status: 200,
    description: '게임 점수 삭제 성공',
  })
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
