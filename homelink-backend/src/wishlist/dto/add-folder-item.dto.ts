import { IsMongoId } from 'class-validator';

export class AddFolderItemDto {
  @IsMongoId()
  listingId: string;
}
