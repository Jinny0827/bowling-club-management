// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  console.log('=== 🎳 볼링 클럽 관리 시스템 시작 ===');
  console.log(
    'DATABASE_URL:',
    process.env.DATABASE_URL ? '✅ 설정됨' : '❌ 설정안됨',
  );
  console.log(
    'JWT_SECRET:',
    process.env.JWT_SECRET ? '✅ 설정됨' : '❌ 설정안됨',
  );
  console.log('==========================================');

  // CORS 설정 (프론트엔드 연동)
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://172.30.1.9:3001',
      'http://bowling-manager.com',
      'https://bowling-manager.com',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
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

  // 🔥 Swagger API 문서화 설정
  const config = new DocumentBuilder()
    .setTitle('🎳 볼링 클럽 관리 시스템 API')
    .setDescription(
      `
      <h2>📋 API 개요</h2>
      <p>볼링장, 클럽, 게임 기록, 회비 관리를 위한 종합 REST API 시스템입니다.</p>

      <h3>🔧 주요 기능</h3>
      <ul>
        <li><strong>🔐 사용자 인증</strong>: JWT 기반 회원가입/로그인</li>
        <li><strong>🎯 게임 기록</strong>: 볼링 게임 점수 및 통계 관리</li>
        <li><strong>👥 클럽 관리</strong>: 볼링 클럽 생성 및 회원 관리</li>
        <li><strong>💰 회비 관리</strong>: 클럽 회비 납부 및 현황 관리</li>
        <li><strong>📊 대시보드</strong>: 개인/클럽 통계 및 현황</li>
      </ul>

      <h3>🚀 인증 방법</h3>
      <ol>
        <li>회원가입 또는 로그인으로 JWT 토큰 발급</li>
        <li>상단의 🔓 Authorize 버튼 클릭</li>
        <li>Bearer 토큰 입력: <code>Bearer your-jwt-token</code></li>
        <li>인증이 필요한 API 테스트 가능</li>
      </ol>

      <h3>📱 테스트 계정</h3>
      <p>
        <strong>이메일:</strong> master@master.com<br>
        <strong>비밀번호:</strong> ㅂㅈㄷㄱ1234
      </p>

      <h3>🔗 관련 링크</h3>
      <ul>
        <li><a href="http://localhost:3001" target="_blank">프론트엔드 (Next.js)</a></li>
        <li><a href="https://github.com/your-repo" target="_blank">GitHub 저장소</a></li>
        <li><a href="/api/docs-json" target="_blank">Swagger JSON</a></li>
      </ul>
    `,
    )
    .setVersion('1.0.0')
    .setContact(
      '개발팀',
      'https://github.com/your-repo',
      'dev@bowling-club.com',
    )
    .setLicense('MIT License', 'https://opensource.org/licenses/MIT')
    .addTag('Authentication', '사용자 회원가입, 로그인, 프로필 관리')
    .addTag('Games', '볼링 게임 점수 입력, 통계, 히스토리 관리')
    .addTag('Clubs', '볼링 클럽 생성, 가입, 회원 관리')
    .addTag('Fees', '클럽 회비 설정, 납부, 현황 관리')
    .addTag('Dashboard', '개인/클럽 통계, 알림, 활동 현황')
    .addTag('Bowling Alleys', '볼링장 정보 및 시설 관리')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description:
          'JWT 토큰을 입력하세요 (예: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)',
        in: 'header',
      },
      'JWT-auth', // 참조 이름
    )
    .addServer('http://localhost:3000', '🔧 개발 서버')
    .addServer('https://api.bowling-club.com', '🚀 프로덕션 서버 (예정)')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // 새로고침해도 인증 정보 유지
      tagsSorter: 'alpha', // 태그 알파벳 순 정렬
      operationsSorter: 'alpha', // API 메서드 알파벳 순 정렬
      docExpansion: 'none', // 기본적으로 모든 섹션 접기
      filter: true, // 검색 필터 활성화
      showRequestHeaders: true, // 요청 헤더 표시
      tryItOutEnabled: true, // Try it out 기능 활성화
    },
    customSiteTitle: '🎳 볼링 클럽 API 문서',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar {
        display: none;
      }
      .swagger-ui .info .title {
        color: #4f46e5;
        font-size: 2.5rem;
        font-weight: bold;
      }
      .swagger-ui .info .description {
        font-size: 1rem;
        line-height: 1.6;
      }
      .swagger-ui .scheme-container {
        background: #f8fafc;
        padding: 20px;
        border-radius: 8px;
        margin: 20px 0;
      }
      .swagger-ui .auth-wrapper {
        padding: 20px;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        margin: 20px 0;
      }
      .swagger-ui .info h1, .swagger-ui .info h2, .swagger-ui .info h3 {
        color: #1e293b;
      }
      .swagger-ui .opblock.opblock-post {
        border-color: #10b981;
        background: rgba(16, 185, 129, 0.1);
      }
      .swagger-ui .opblock.opblock-get {
        border-color: #3b82f6;
        background: rgba(59, 130, 246, 0.1);
      }
      .swagger-ui .opblock.opblock-put {
        border-color: #f59e0b;
        background: rgba(245, 158, 11, 0.1);
      }
      .swagger-ui .opblock.opblock-delete {
        border-color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
      }
      .swagger-ui .opblock.opblock-patch {
        border-color: #8b5cf6;
        background: rgba(139, 92, 246, 0.1);
      }
      .swagger-ui .opblock-tag {
        font-size: 1.2rem;
        font-weight: bold;
        color: #374151;
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 10px;
        margin-bottom: 15px;
      }
      .swagger-ui .btn.authorize {
        background-color: #4f46e5;
        border-color: #4f46e5;
      }
      .swagger-ui .btn.authorize svg {
        fill: white;
      }
    `,
    customJs: `
      // 페이지 로드 시 환영 메시지
      window.onload = function() {
        console.log('🎳 볼링 클럽 관리 시스템 API 문서에 오신 것을 환영합니다!');
        console.log('📖 문서 사용법:');
        console.log('1. 상단의 🔓 Authorize 버튼으로 JWT 토큰 설정');
        console.log('2. 각 API의 "Try it out" 버튼으로 테스트 실행');
        console.log('3. 테스트 계정: master@master.com / ㅂㅈㄷㄱ1234');
      };
    `,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log('🎉 서버 시작 완료!');
  console.log(`🚀 Application: http://localhost:${port}`);
  console.log(`📖 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`📄 Swagger JSON: http://localhost:${port}/api/docs-json`);
  console.log(`📱 Frontend: http://localhost:3001`);
  console.log('==========================================');
}

bootstrap().catch((err) => {
  console.error('❌ 서버 시작 실패:', err);
  process.exit(1);
});
