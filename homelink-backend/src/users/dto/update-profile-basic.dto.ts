import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileBasicDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  firstName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  lastName: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(120)
  email?: string;
}
