import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { toObjectId } from '../common/utils/mongo.util';
import { buildPaginationMeta } from '../common/utils/pagination.util';
import { Listing, type ListingDocument } from '../explore/schemas/listing.schema';
import { User, type UserDocument } from '../users/schemas/user.schema';
import {
  Booking,
  type BookingDocument,
  type BookingStatus,
} from './schemas/booking.schema';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Listing.name)
    private readonly listingModel: Model<ListingDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async createBooking(input: {
    renterId: string;
    landlordId: string;
    listingId: string;
    stayYears: number;
  }) {
    const listing = await this.listingModel.findById(input.listingId).exec();
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }
    const landlord = await this.userModel.findById(input.landlordId).exec();
    if (!landlord) {
      throw new NotFoundException('Landlord not found');
    }

    const rentAmount = listing.price;
    const serviceFee = Number((rentAmount * 0.03).toFixed(2));
    const amountPaid = rentAmount + serviceFee;
    const checkInBeforeAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const booking = await this.bookingModel.create({
      renterId: toObjectId(input.renterId),
      landlordId: toObjectId(input.landlordId),
      listingId: listing._id,
      status: 'pending',
      stayYears: input.stayYears,
      rentAmount,
      serviceFee,
      amountPaid,
      checkInBeforeAt,
      directionsFromLandlord: 'Please call me when you arrive at the estate.',
      apartmentRules:
        'Respect neighbors, keep the apartment clean, and avoid loud noise at night.',
      cancellationPolicy: 'moderate',
    });

    return this.serializeBookingCard(booking, listing);
  }

  async listBookings(userId: string, status: BookingStatus | undefined, page: number, limit: number) {
    const query: Record<string, unknown> = { renterId: toObjectId(userId) };
    if (status) {
      query.status = status;
    }
    const skip = (page - 1) * limit;
    const [total, rawBookings] = await Promise.all([
      this.bookingModel.countDocuments(query).exec(),
      this.bookingModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate<{ listingId: ListingDocument }>('listingId')
        .exec(),
    ]);
    const bookings = rawBookings as unknown as Array<
      BookingDocument & { listingId: ListingDocument }
    >;

    return {
      pagination: buildPaginationMeta(page, limit, total),
      bookings: bookings.map((booking) =>
        this.serializeBookingCard(booking, booking.listingId),
      ),
    };
  }

  async getBookingDetails(userId: string, bookingId: string) {
    const rawBooking = await this.bookingModel
      .findOne({ _id: bookingId, renterId: toObjectId(userId) })
      .populate<{ listingId: ListingDocument }>('listingId')
      .populate<{ landlordId: UserDocument }>('landlordId')
      .exec();
    if (!rawBooking) {
      throw new NotFoundException('Booking not found');
    }
    const booking = rawBooking as unknown as BookingDocument & {
      listingId: ListingDocument;
      landlordId: UserDocument;
    };

    return {
      ...this.serializeBookingCard(booking, booking.listingId),
      bookingId: booking._id.toString(),
      stayYears: booking.stayYears,
      rentAmount: booking.rentAmount,
      serviceFee: booking.serviceFee,
      amountPaid: booking.amountPaid,
      checkInBeforeAt: booking.checkInBeforeAt,
      checkedInAt: booking.checkedInAt ?? null,
      directionsFromLandlord: booking.directionsFromLandlord ?? null,
      apartmentRules: booking.apartmentRules ?? null,
      cancellationPolicy: booking.cancellationPolicy,
      map: {
        latitude: booking.listingId.latitude,
        longitude: booking.listingId.longitude,
        city: booking.listingId.city,
        state: booking.listingId.state,
        address: booking.listingId.address,
      },
      landlord: {
        id: booking.landlordId._id.toString(),
        displayName: booking.landlordId.displayName ?? null,
        profilePhotoUrl: booking.landlordId.profilePhotoUrl ?? null,
      },
      cancellation: booking.cancellation ?? null,
      review: booking.review ?? null,
    };
  }

  async confirmCheckIn(userId: string, bookingId: string) {
    const booking = await this.bookingModel
      .findOne({ _id: bookingId, renterId: toObjectId(userId) })
      .exec();
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.status === 'cancelled') {
      throw new BadRequestException('Cannot check-in on cancelled booking');
    }
    booking.status = 'active';
    booking.checkedInAt = new Date();
    await booking.save();
    return {
      message: 'Check-in confirmed',
      bookingId: booking._id.toString(),
      status: booking.status,
      checkedInAt: booking.checkedInAt,
    };
  }

  async getCancelPreview(userId: string, bookingId: string) {
    const booking = await this.bookingModel
      .findOne({ _id: bookingId, renterId: toObjectId(userId) })
      .exec();
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.status === 'cancelled') {
      throw new BadRequestException('Booking already cancelled');
    }
    const refundAmount = booking.amountPaid;
    return {
      bookingId: booking._id.toString(),
      totalPaid: booking.amountPaid,
      refundAmount,
      deductedPenalty: 0,
      serviceFeeRefund: booking.serviceFee,
      estimatedRefundTime: '1-3 business days',
      cancellationPolicyApplied: booking.cancellationPolicy,
    };
  }

  async cancelBooking(
    userId: string,
    bookingId: string,
    input: { reason: string; details?: string; attachments?: string[] },
  ) {
    const booking = await this.bookingModel
      .findOne({ _id: bookingId, renterId: toObjectId(userId) })
      .exec();
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.status === 'cancelled') {
      throw new BadRequestException('Booking already cancelled');
    }

    booking.status = 'cancelled';
    booking.cancellation = {
      reason: input.reason.trim(),
      details: input.details?.trim(),
      attachments: (input.attachments ?? []).map((item) => item.trim()).filter(Boolean),
      refundAmount: booking.amountPaid,
      refundStatus: 'pending',
      cancelledAt: new Date(),
    };
    await booking.save();
    return {
      message: 'Booking cancelled successfully',
      bookingId: booking._id.toString(),
      status: booking.status,
      refundAmount: booking.cancellation.refundAmount,
      refundStatus: booking.cancellation.refundStatus,
    };
  }

  async submitReview(
    userId: string,
    bookingId: string,
    input: { rating: number; comment?: string },
  ) {
    const booking = await this.bookingModel
      .findOne({ _id: bookingId, renterId: toObjectId(userId) })
      .exec();
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.status !== 'active' && booking.status !== 'completed') {
      throw new BadRequestException('Review can only be submitted after check-in');
    }
    booking.review = {
      rating: input.rating,
      comment: input.comment?.trim(),
      submittedAt: new Date(),
    };
    await booking.save();
    return {
      message: 'Review submitted',
      bookingId: booking._id.toString(),
      review: booking.review,
    };
  }

  private serializeBookingCard(
    booking: {
      _id: { toString(): string };
      status: BookingStatus;
      rentAmount: number;
      checkInBeforeAt: Date;
      checkedInAt?: Date;
      createdAt?: Date;
    },
    listing: {
      _id: { toString(): string };
      title: string;
      city: string;
      state: string;
      address: string;
      images: string[];
      priceUnit: string;
    },
  ) {
    return {
      id: booking._id.toString(),
      status: booking.status,
      listing: {
        id: listing._id.toString(),
        title: listing.title,
        city: listing.city,
        state: listing.state,
        address: listing.address,
        image: listing.images[0] ?? null,
      },
      rentAmount: booking.rentAmount,
      priceUnit: listing.priceUnit,
      checkInBeforeAt: booking.checkInBeforeAt,
      checkedInAt: booking.checkedInAt ?? null,
      createdAt: booking.createdAt ?? null,
    };
  }
}
