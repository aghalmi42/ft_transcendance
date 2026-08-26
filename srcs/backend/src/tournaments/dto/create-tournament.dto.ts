import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTournamentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  name!: string;

  @IsIn([4, 8])
  size!: 4 | 8;
}
