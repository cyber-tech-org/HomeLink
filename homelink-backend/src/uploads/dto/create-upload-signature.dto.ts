import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUploadSignatureDto {
  @IsIn(['profile', 'chat', 'listing', 'misc'])
  folderType: 'profile' | 'chat' | 'listing' | 'misc';

  @IsOptional()
  @IsIn(['image', 'video', 'raw', 'auto'])
  resourceType?: 'image' | 'video' | 'raw' | 'auto';

  @IsOptional()
  @IsString()
  @MinLength(1)
  conversationId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  listingId?: string;
}
