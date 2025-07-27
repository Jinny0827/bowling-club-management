import { IsUUID, IsInt, Min, Max } from 'class-validator';

export class CreateGameScoreDto {
  @IsUUID()
  gameId: string;

  @IsInt()
  @Min(0)
  @Max(300)
  score: number;

  @IsInt()
  @Min(1)
  gameOrder: number;
}
