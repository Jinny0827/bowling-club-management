import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateGameDto {
  @IsUUID()
  clubId: string;

  @IsUUID()
  bowlingCenterId: string;

  @IsDateString()
  gameDate: string;

  @IsOptional()
  @IsString()
  gameType?: string;
}
