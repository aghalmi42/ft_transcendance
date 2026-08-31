import { IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { UserStatus } from '../../common/enums/user-status.enum';
import { UserRole } from '../../common/enums/user-role.enum';

export class AdminUpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(32)
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  bio?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
