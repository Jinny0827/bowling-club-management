import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// 전역 모듈로 설정 -> 다른 모듈 사용시 import 처리 X
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
  // 다른 모듈에서 사용할 수 있도록 export
})
export class PrismaModule {}
