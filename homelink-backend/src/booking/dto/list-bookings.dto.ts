import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

const BOOKING_TABS = ['upcoming', 'pending', 'active', 'cancelled'] as const;

export class ListBookingsDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(BOOKING_TABS)
  status?: (typeof BOOKING_TABS)[number];
}
