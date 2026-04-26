import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CancelPreviewDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  reason?: string;
}
