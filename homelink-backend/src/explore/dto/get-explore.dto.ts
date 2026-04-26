import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

const EXPLORE_TABS = [
  'popular',
  'duplex',
  'self_contain',
  'short_let',
  'shared_space',
] as const;

export type ExploreTab = (typeof EXPLORE_TABS)[number];
const EXPLORE_VIEWS = ['list', 'map'] as const;
export type ExploreView = (typeof EXPLORE_VIEWS)[number];

export class GetExploreDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(EXPLORE_TABS)
  tab?: ExploreTab;

  @IsOptional()
  @IsString()
  @MinLength(1)
  search?: string;

  @IsOptional()
  @IsIn(EXPLORE_VIEWS)
  view?: ExploreView;
}
