import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AccessTokenUser } from '../auth/strategies/jwt.strategy';
import { BookingService } from './booking.service';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { CancelPreviewDto } from './dto/cancel-preview.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ListBookingsDto } from './dto/list-bookings.dto';
import { SubmitReviewDto } from './dto/submit-review.dto';

type AuthRequest = Request & { user: AccessTokenUser };

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  createBooking(@Req() req: AuthRequest, @Body() dto: CreateBookingDto) {
    return this.bookingService.createBooking({
      renterId: req.user.userId,
      landlordId: dto.landlordId,
      listingId: dto.listingId,
      stayYears: dto.stayYears,
    });
  }

  @Get()
  listBookings(@Req() req: AuthRequest, @Query() query: ListBookingsDto) {
    return this.bookingService.listBookings(
      req.user.userId,
      query.status,
      query.page ?? 1,
      query.limit ?? 10,
    );
  }

  @Get(':bookingId')
  getBookingDetails(@Req() req: AuthRequest, @Param('bookingId') bookingId: string) {
    return this.bookingService.getBookingDetails(req.user.userId, bookingId);
  }

  @Get(':bookingId/cancel-preview')
  getCancelPreview(
    @Req() req: AuthRequest,
    @Param('bookingId') bookingId: string,
    @Query() _query: CancelPreviewDto,
  ) {
    return this.bookingService.getCancelPreview(req.user.userId, bookingId);
  }

  @Post(':bookingId/cancel')
  cancelBooking(
    @Req() req: AuthRequest,
    @Param('bookingId') bookingId: string,
    @Body() dto: CancelBookingDto,
  ) {
    return this.bookingService.cancelBooking(req.user.userId, bookingId, dto);
  }

  @Post(':bookingId/check-in/confirm')
  confirmCheckIn(@Req() req: AuthRequest, @Param('bookingId') bookingId: string) {
    return this.bookingService.confirmCheckIn(req.user.userId, bookingId);
  }

  @Post(':bookingId/review')
  submitReview(
    @Req() req: AuthRequest,
    @Param('bookingId') bookingId: string,
    @Body() dto: SubmitReviewDto,
  ) {
    return this.bookingService.submitReview(req.user.userId, bookingId, dto);
  }
}
