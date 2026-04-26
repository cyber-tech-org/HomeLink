import { IsArray, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CancelBookingDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  reason: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  details?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}
