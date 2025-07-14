import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email: string;

  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @MinLength(6, { message: '비밀번호는 최소 6자리 이상이어야 합니다.' })
  password: string;

  @IsString({ message: '이름은 문자열이어야 합니다.' })
  @MinLength(2, { message: '이름은 최소 2자리 이상이어야 합니다.' })
  name: string;

  @IsOptional()
  @IsString({ message: '전화번호는 문자열이어야 합니다.' })
  phoneNumber?: string;

  @IsOptional()
  @IsString({ message: '프로필 이미지 URL은 문자열이어야 합니다.' })
  profileImageUrl?: string;
}
