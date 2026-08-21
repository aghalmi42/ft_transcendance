
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class SearchQueryDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  q!: string;
}
