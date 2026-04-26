import { IsMongoId, IsOptional } from 'class-validator';

export class CreateConversationDto {
  @IsMongoId()
  participantId: string;

  @IsOptional()
  @IsMongoId()
  listingId?: string;
}
