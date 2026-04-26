import { IsInt, IsMongoId, Min } from 'class-validator';

export class CreateBookingDto {
  @IsMongoId()
  listingId: string;

  @IsMongoId()
  landlordId: string;

  @IsInt()
  @Min(1)
  stayYears: number;
}
