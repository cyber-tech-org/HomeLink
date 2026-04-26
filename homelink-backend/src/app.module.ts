import { Module } from '@nestjs/common';
import { BookingModule } from './booking/booking.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { ExploreModule } from './explore/explore.module';
import { UploadsModule } from './uploads/uploads.module';
import { WishlistModule } from './wishlist/wishlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    BookingModule,
    ChatModule,
    ExploreModule,
    UploadsModule,
    WishlistModule,
  ],
})
export class AppModule {}
