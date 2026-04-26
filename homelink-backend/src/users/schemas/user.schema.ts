import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ sparse: true, unique: true, trim: true })
  phoneNumber?: string;

  @Prop({ select: false })
  passwordHash?: string;

  @Prop({ sparse: true, unique: true })
  googleId?: string;

  @Prop({ sparse: true, unique: true })
  facebookId?: string;

  @Prop({ trim: true })
  displayName?: string;

  @Prop({ enum: ['rent', 'list'] })
  profileUseCase?: 'rent' | 'list';

  @Prop({ trim: true })
  firstName?: string;

  @Prop({ trim: true })
  lastName?: string;

  @Prop({ trim: true, lowercase: true })
  email?: string;

  @Prop({ trim: true })
  bio?: string;

  @Prop({ trim: true })
  occupation?: string;

  @Prop({ type: [String], default: [] })
  languages: string[];

  @Prop({ trim: true })
  address?: string;

  @Prop({ trim: true })
  city?: string;

  @Prop({ trim: true })
  state?: string;

  @Prop({ trim: true })
  country?: string;

  @Prop()
  latitude?: number;

  @Prop()
  longitude?: number;

  @Prop()
  isMarried?: boolean;

  @Prop()
  hasPets?: boolean;

  @Prop({ trim: true })
  profilePhotoUrl?: string;

  @Prop({ trim: true })
  profilePhotoPublicId?: string;

  @Prop({ default: false })
  profileCompleted: boolean;

  @Prop({ default: false })
  notificationsEnabled: boolean;

  @Prop({ default: false })
  locationPermissionGranted: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
