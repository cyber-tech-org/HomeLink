import { IsArray, IsMongoId, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsOptional()
  @IsMongoId()
  conversationId?: string;

  @IsOptional()
  @IsMongoId()
  recipientId?: string;

  @IsOptional()
  @IsMongoId()
  listingId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  text?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}
