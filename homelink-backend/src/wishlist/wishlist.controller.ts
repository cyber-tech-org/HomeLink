import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AccessTokenUser } from '../auth/strategies/jwt.strategy';
import { AddFolderItemDto } from './dto/add-folder-item.dto';
import { CreateFolderDto } from './dto/create-folder.dto';
import { PaginationDto } from './dto/pagination.dto';
import { RenameFolderDto } from './dto/rename-folder.dto';
import { WishlistService } from './wishlist.service';

type AuthRequest = Request & { user: AccessTokenUser };

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get('folders')
  listFolders(@Req() req: AuthRequest) {
    return this.wishlistService.listFolders(req.user.userId);
  }

  @Post('folders')
  createFolder(@Req() req: AuthRequest, @Body() dto: CreateFolderDto) {
    return this.wishlistService.createFolder(req.user.userId, dto.name);
  }

  @Patch('folders/:folderId')
  renameFolder(
    @Req() req: AuthRequest,
    @Param('folderId') folderId: string,
    @Body() dto: RenameFolderDto,
  ) {
    return this.wishlistService.renameFolder(req.user.userId, folderId, dto.name);
  }

  @Delete('folders/:folderId')
  deleteFolder(@Req() req: AuthRequest, @Param('folderId') folderId: string) {
    return this.wishlistService.deleteFolder(req.user.userId, folderId);
  }

  @Get('folders/:folderId/listings')
  getFolderListings(
    @Req() req: AuthRequest,
    @Param('folderId') folderId: string,
    @Query() query: PaginationDto,
  ) {
    return this.wishlistService.getFolderListings(
      req.user.userId,
      folderId,
      query.page ?? 1,
      query.limit ?? 10,
    );
  }

  @Post('folders/:folderId/listings')
  addListingToFolder(
    @Req() req: AuthRequest,
    @Param('folderId') folderId: string,
    @Body() dto: AddFolderItemDto,
  ) {
    return this.wishlistService.addListingToFolder(
      req.user.userId,
      folderId,
      dto.listingId,
    );
  }

  @Delete('folders/:folderId/listings/:listingId')
  removeListingFromFolder(
    @Req() req: AuthRequest,
    @Param('folderId') folderId: string,
    @Param('listingId') listingId: string,
  ) {
    return this.wishlistService.removeListingFromFolder(
      req.user.userId,
      folderId,
      listingId,
    );
  }

  @Get('listings/:listingId/folders')
  foldersForListing(@Req() req: AuthRequest, @Param('listingId') listingId: string) {
    return this.wishlistService.foldersForListing(req.user.userId, listingId);
  }
}
