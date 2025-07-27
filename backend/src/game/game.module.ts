import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GameController } from './game.controller';
import { GameService } from './game.service';

@Module({
  imports: [PrismaModule],
  controllers: [GameController],
  providers: [GameService],
  exports: [GameService],
})
export class GamesModule {}
