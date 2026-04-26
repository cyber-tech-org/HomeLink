import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BookingDocument = HydratedDocument<Booking>;

export const BOOKING_STATUSES = [
  'pending',
  'upcoming',
  'active',
  'cancelled',
  'completed',
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

@Schema({ _id: false })
class BookingCancellation {
  @Prop({ trim: true, required: true })
  reason: string;

  @Prop({ trim: true })
  details?: string;

  @Prop({ type: [String], default: [] })
  attachments: string[];

  @Prop({ required: true })
  refundAmount: number;

  @Prop({ trim: true, default: 'pending' })
  refundStatus: string;

  @Prop({ required: true })
  cancelledAt: Date;
}

@Schema({ _id: false })
class BookingReview {
  @Prop({ min: 1, max: 5 })
  rating?: number;

  @Prop({ trim: true })
  comment?: string;

  @Prop()
  submittedAt?: Date;
}

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  renterId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  landlordId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Listing', required: true, index: true })
  listingId: Types.ObjectId;

  @Prop({ enum: BOOKING_STATUSES, default: 'pending', index: true })
  status: BookingStatus;

  @Prop({ required: true })
  stayYears: number;

  @Prop({ required: true })
  rentAmount: number;

  @Prop({ required: true })
  serviceFee: number;

  @Prop({ required: true })
  amountPaid: number;

  @Prop({ required: true })
  checkInBeforeAt: Date;

  @Prop()
  checkedInAt?: Date;

  @Prop({ trim: true })
  directionsFromLandlord?: string;

  @Prop({ trim: true })
  apartmentRules?: string;

  @Prop({ trim: true, default: 'moderate' })
  cancellationPolicy: string;

  @Prop({ type: BookingCancellation })
  cancellation?: BookingCancellation;

  @Prop({ type: BookingReview })
  review?: BookingReview;

  createdAt?: Date;
  updatedAt?: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
