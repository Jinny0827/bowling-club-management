import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // 환경 변수 설정
    ConfigModule.forRoot({
      // 전역에서 환경 변수로 사용가능
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Prisma 모듈
    PrismaModule,
    // AuthModule,
    // UsersModule,
    // ClubsModule,
    // GamesModule,
    // FeesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
