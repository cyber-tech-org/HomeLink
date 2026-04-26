import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type WishlistFolderDocument = HydratedDocument<WishlistFolder>;

@Schema({ timestamps: true })
export class WishlistFolder {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ trim: true, required: true })
  name: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const WishlistFolderSchema = SchemaFactory.createForClass(WishlistFolder);
WishlistFolderSchema.index({ userId: 1, name: 1 }, { unique: true });
