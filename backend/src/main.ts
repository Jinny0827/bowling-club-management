import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  console.log('=== 데이터베이스 연결 정보 ===');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? '설정됨' : '설정안됨');
  console.log('=============================');

  // CORS 설정(프론트 엔드)
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'], // 프론트엔드 URL
    credentials: true,
  });

  // 전역 ValidationPipe 설정
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 자동 타입 변환
      whitelist: true, // DTO에 정의되지 않은 속성 제거
      forbidNonWhitelisted: true, // DTO에 없는 속성이 있으면 에러 발생
      transformOptions: {
        enableImplicitConversion: true, // 암시적 타입 변환 허용
      },
    }),
  );

  // API prefix 설정
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📖 API Documentation: http://localhost:${port}/api`);
}
bootstrap();
