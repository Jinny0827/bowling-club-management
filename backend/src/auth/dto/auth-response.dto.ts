import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT 토큰',
  })
  accessToken: string;

  @ApiProperty({
    description: '사용자 정보',
    example: {
      id: 'cm5x1234567890abcdef',
      email: 'user@example.com',
      name: '홍길동',
      phoneNumber: '010-1234-5678',
      profileImageUrl: null,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  })
  user: {
    id: string;
    email: string;
    name: string;
    phoneNumber?: string | null;
    profileImageUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}
