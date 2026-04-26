import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Listing, ListingSchema } from '../explore/schemas/listing.schema';
import {
  WishlistFolder,
  WishlistFolderSchema,
} from './schemas/wishlist-folder.schema';
import { WishlistItem, WishlistItemSchema } from './schemas/wishlist-item.schema';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WishlistFolder.name, schema: WishlistFolderSchema },
      { name: WishlistItem.name, schema: WishlistItemSchema },
      { name: Listing.name, schema: ListingSchema },
    ]),
  ],
  controllers: [WishlistController],
  providers: [WishlistService],
})
export class WishlistModule {}
