import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { ExploreController } from './explore.controller';
import { ExploreService } from './explore.service';
import { Listing, ListingSchema } from './schemas/listing.schema';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([{ name: Listing.name, schema: ListingSchema }]),
  ],
  controllers: [ExploreController],
  providers: [ExploreService],
})
export class ExploreModule {}
