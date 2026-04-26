import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ type: [Types.ObjectId], ref: 'User', required: true, index: true })
  participantIds: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Listing', required: false, index: true })
  listingId?: Types.ObjectId;

  @Prop({ trim: true, default: '' })
  lastMessageText: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  lastMessageSenderId?: Types.ObjectId;

  @Prop({ required: false, index: true })
  lastMessageAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
ConversationSchema.index({ participantIds: 1, listingId: 1 });
