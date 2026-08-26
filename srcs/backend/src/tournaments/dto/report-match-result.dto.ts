import { IsInt, IsUUID, Min } from 'class-validator';

export class ReportMatchResultDto {
  @IsUUID()
  winnerId!: string;

  @IsInt()
  @Min(0)
  score1!: number;

  @IsInt()
  @Min(0)
  score2!: number;
}
