import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Listing, ListingSchema } from '../explore/schemas/listing.schema';
import { User, UserSchema } from './schemas/user.schema';
import {
  OtpVerification,
  OtpVerificationSchema,
} from './schemas/otp-verification.schema';
import { LocationSearchService } from './location/location-search.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: OtpVerification.name, schema: OtpVerificationSchema },
      { name: Listing.name, schema: ListingSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, LocationSearchService],
  exports: [UsersService],
})
export class UsersModule {}
