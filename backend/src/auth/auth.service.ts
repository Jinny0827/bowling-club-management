import { UsersService } from '../user/users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './jwt.strategy';
import { LoginDto } from './dto/login.dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // 사용자 생성
    const user = await this.usersService.createUser(registerDto);

    // JWT 토큰 생성
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // 사용자 존재 확인
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    // 비밀번호 검증
    const isPasswordValid = await this.usersService.validatePassword(
      password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    // JWT 토큰 생성
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };
    const accessToken = this.jwtService.sign(payload);

    // 응답에서 비밀번호 해시 제거 하고 null 처리
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      accessToken,
      user: {
        ...userWithoutPassword,
        phoneNumber: userWithoutPassword.phoneNumber || undefined,
        profileImageUrl: userWithoutPassword.profileImageUrl || undefined,
        updatedAt: userWithoutPassword.updatedAt,
      },
    };
  }

  async getProfile(userId: string) {
    return this.usersService.findById(userId);
  }
}
