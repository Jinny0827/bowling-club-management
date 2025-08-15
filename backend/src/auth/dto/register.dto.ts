import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: '이메일' })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email: string;

  @ApiProperty({ example: 'myPassword123', description: '비밀번호 (최소 6자)' })
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @MinLength(6, { message: '비밀번호는 최소 6자리 이상이어야 합니다.' })
  password: string;

  @ApiProperty({ example: '홍길동', description: '이름 (최소 2자)' })
  @IsString({ message: '이름은 문자열이어야 합니다.' })
  @MinLength(2, { message: '이름은 최소 2자리 이상이어야 합니다.' })
  name: string;

  @ApiProperty({
    example: '010-1234-5678',
    description: '전화번호',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '전화번호는 문자열이어야 합니다.' })
  phoneNumber?: string;

  @ApiProperty({
    example: 'https://example.com/profile.jpg',
    description: '프로필 이미지 URL',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '프로필 이미지 URL은 문자열이어야 합니다.' })
  profileImageUrl?: string;
}
