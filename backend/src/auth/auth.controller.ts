// backend/src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Authentication') // ← 🔥 변경: 영어로 수정
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: '회원가입',
    description: '새로운 사용자 계정을 생성합니다.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
    type: AuthResponseDto,
    schema: {
      example: {
        statusCode: 201,
        message: '회원가입이 완료되었습니다.',
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: 'cm5x1234567890abcdef',
            email: 'user@example.com',
            name: '홍길동',
            phoneNumber: '010-1234-5678',
            profileImageUrl: null,
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 입력 데이터',
    schema: {
      example: {
        statusCode: 400,
        message: [
          '올바른 이메일 형식이 아닙니다.',
          '비밀번호는 최소 6자리 이상이어야 합니다.',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: '이미 존재하는 이메일',
    schema: {
      example: {
        statusCode: 409,
        message: '이미 등록된 이메일입니다.',
        error: 'Conflict',
      },
    },
  })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      const result = await this.authService.register(registerDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: '회원가입이 완료되었습니다.',
        data: result,
      };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new HttpException(
          '이미 등록된 이메일입니다.',
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(
        '회원가입 중 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({
    summary: '로그인',
    description: '이메일과 비밀번호로 로그인합니다.',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      default: {
        summary: '기본 로그인',
        value: {
          email: 'user@example.com',
          password: 'myPassword123',
        },
      },
      testAccount: {
        summary: '테스트 계정',
        value: {
          email: 'master@master.com',
          password: 'ㅂㅈㄷㄱ1234',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    type: AuthResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: '로그인이 완료되었습니다.',
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: 'cm5x1234567890abcdef',
            email: 'master@master.com',
            name: '관리자',
            phoneNumber: '010-0000-0000',
            profileImageUrl: null,
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '로그인 실패',
    schema: {
      example: {
        statusCode: 401,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        error: 'Unauthorized',
      },
    },
  })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      const result = await this.authService.login(loginDto);
      return {
        statusCode: HttpStatus.OK,
        message: '로그인이 완료되었습니다.',
        data: result,
      };
    } catch (error: any) {
      throw new HttpException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @ApiOperation({
    summary: '현재 사용자 정보 조회',
    description: 'JWT 토큰에서 사용자 정보를 바로 반환 (빠른 응답)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: '사용자 정보 조회 성공',
    schema: {
      example: {
        statusCode: 200,
        message: '사용자 정보 조회가 완료되었습니다.',
        data: {
          id: 'cm5x1234567890abcdef',
          email: 'master@master.com',
          name: '관리자',
          phoneNumber: '010-0000-0000',
          profileImageUrl: null,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getCurrentUser(@Request() req: any) {
    return {
      statusCode: HttpStatus.OK,
      message: '사용자 정보 조회가 완료되었습니다.',
      data: req.user,
    };
  }

  @ApiOperation({
    summary: '상세 프로필 조회',
    description:
      'DB에서 최신 사용자 정보를 조회 (전화번호, 프로필 이미지 등 포함)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: '프로필 조회 성공',
    schema: {
      example: {
        statusCode: 200,
        message: '프로필 조회가 완료되었습니다.',
        data: {
          id: 'cm5x1234567890abcdef',
          email: 'master@master.com',
          name: '관리자',
          phoneNumber: '010-0000-0000',
          profileImageUrl: null,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    try {
      const user = await this.authService.getProfile(req.user.id as string);
      return {
        statusCode: HttpStatus.OK,
        message: '프로필 조회가 완료되었습니다.',
        data: user,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        '프로필 조회 중 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
