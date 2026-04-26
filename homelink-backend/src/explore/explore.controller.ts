import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AccessTokenUser } from '../auth/strategies/jwt.strategy';
import { ExploreService } from './explore.service';
import { GetExploreDto } from './dto/get-explore.dto';

type AuthRequest = Request & { user: AccessTokenUser };

@Controller('explore')
@UseGuards(JwtAuthGuard)
export class ExploreController {
  constructor(private readonly exploreService: ExploreService) {}

  @Get()
  getExplore(@Req() req: AuthRequest, @Query() query: GetExploreDto) {
    return this.exploreService.getExploreFeed(
      req.user,
      query.tab,
      query.page ?? 1,
      query.limit ?? 10,
      query.search,
      query.view ?? 'list',
    );
  }
}
