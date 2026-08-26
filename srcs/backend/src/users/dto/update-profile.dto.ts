import { IsEnum, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { UserStatus } from '../../common/enums/user-status.enum';

// Accepts either a real URL (preset/custom avatar) or our own uploaded file path
// (as returned by POST /users/me/avatar), but nothing else.
const AVATAR_PATTERN = /^(https?:\/\/[^\s]+|\/uploads\/avatars\/[^\s/]+)$/;

/**
 * Self-service profile update. Deliberately excludes email, password, role
 * and game stats (wins/losses/xp/level/elo) — those are never client-writable.
 */
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
