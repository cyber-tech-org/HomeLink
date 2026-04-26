import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type WishlistItemDocument = HydratedDocument<WishlistItem>;

@Schema({ timestamps: true })
export class WishlistItem {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'WishlistFolder', required: true, index: true })
  folderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Listing', required: true, index: true })
  listingId: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

export const WishlistItemSchema = SchemaFactory.createForClass(WishlistItem);
WishlistItemSchema.index({ userId: 1, folderId: 1, listingId: 1 }, { unique: true });
