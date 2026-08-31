import { IsEnum, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { UserStatus } from '../../common/enums/user-status.enum';

const AVATAR_PATTERN = /^(https?:\/\/[^\s]+|\/uploads\/avatars\/[^\s/]+)$/;

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(32)
  username?: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  bio?: string;

  @IsOptional()
  @Matches(AVATAR_PATTERN, { message: 'avatar must be a valid URL or an uploaded avatar path' })
  avatar?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
