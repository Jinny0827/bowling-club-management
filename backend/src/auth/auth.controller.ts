// src/auth/auth.controller.ts (수정된 버전)
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      console.log('Register 요청:', registerDto);
      const result = await this.authService.register(registerDto);

      return {
        statusCode: HttpStatus.CREATED,
        message: '회원가입이 완료되었습니다.',
        data: result,
      };
    } catch (error: any) {
      console.error('Register 에러:', error);
      // 💡 타입 명시
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
      // 💡 타입 명시
      throw new HttpException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async profile(@Request() req: any) {
    // 💡 타입 명시
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

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getCurrentUser(@Request() req: any) {
    // 💡 타입 명시
    return {
      statusCode: HttpStatus.OK,
      message: '사용자 정보 조회가 완료되었습니다.',
      data: req.user,
    };
  }
}
