import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateProfilePhotoDto {
  @IsUrl()
  @MaxLength(500)
  url: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  publicId?: string;
}
