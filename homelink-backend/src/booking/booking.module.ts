import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Listing, ListingSchema } from '../explore/schemas/listing.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking, BookingSchema } from './schemas/booking.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: Listing.name, schema: ListingSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
