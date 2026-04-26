import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ListingDocument = HydratedDocument<Listing>;

export const LISTING_TYPES = [
  'duplex',
  'self_contain',
  'short_let',
  'shared_space',
] as const;

export type ListingType = (typeof LISTING_TYPES)[number];

@Schema({ timestamps: true })
export class Listing {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  ownerId?: Types.ObjectId;

  @Prop({ trim: true, required: true })
  title: string;

  @Prop({ enum: LISTING_TYPES, required: true })
  type: ListingType;

  @Prop({ trim: true, required: true })
  address: string;

  @Prop({ trim: true, required: true })
  city: string;

  @Prop({ trim: true, required: true })
  state: string;

  @Prop({ trim: true, default: 'Nigeria' })
  country: string;

  @Prop({ required: true })
  price: number;

  @Prop({ trim: true, default: 'year' })
  priceUnit: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: false })
  isPopular: boolean;

  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;
}

export const ListingSchema = SchemaFactory.createForClass(Listing);
