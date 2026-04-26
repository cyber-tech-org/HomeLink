import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Listing, type ListingDocument } from '../explore/schemas/listing.schema';
import { User, UserDocument } from './schemas/user.schema';
import {
  OtpPurpose,
  OtpVerification,
  OtpVerificationDocument,
} from './schemas/otp-verification.schema';
import { LocationSearchService } from './location/location-search.service';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(OtpVerification.name)
    private otpModel: Model<OtpVerificationDocument>,
    @InjectModel(Listing.name)
    private listingModel: Model<ListingDocument>,
    private readonly locationSearchService: LocationSearchService,
  ) {}

  private mapUserProfile(user: UserDocument) {
    return {
      id: user._id.toString(),
      phoneNumber: user.phoneNumber ?? null,
      displayName: user.displayName ?? null,
      useCase: user.profileUseCase ?? null,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      email: user.email ?? null,
      bio: user.bio ?? null,
      occupation: user.occupation ?? null,
      languages: user.languages ?? [],
      location: {
        address: user.address ?? null,
        city: user.city ?? null,
        state: user.state ?? null,
        country: user.country ?? null,
        latitude: user.latitude ?? null,
        longitude: user.longitude ?? null,
      },
      isMarried: user.isMarried ?? null,
      hasPets: user.hasPets ?? null,
      profilePhotoUrl: user.profilePhotoUrl ?? null,
      profilePhotoPublicId: user.profilePhotoPublicId ?? null,
      profileCompleted: user.profileCompleted ?? false,
      preferences: {
        notificationsEnabled: user.notificationsEnabled ?? false,
        locationPermissionGranted: user.locationPermissionGranted ?? false,
      },
    };
  }

  async findByPhone(phoneNumber: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ phoneNumber }).exec();
  }

  async findByPhoneWithPassword(
    phoneNumber: string,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ phoneNumber })
      .select('+passwordHash')
      .exec();
  }

  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ googleId }).exec();
  }

  async findByFacebookId(facebookId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ facebookId }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async createWithPhoneAndPassword(
    phoneNumber: string,
    plainPassword: string,
    displayName?: string,
  ): Promise<UserDocument> {
    const passwordHash = await bcrypt.hash(plainPassword, SALT_ROUNDS);
    const user = new this.userModel({
      phoneNumber,
      passwordHash,
      displayName,
    });
    return user.save();
  }

  async updatePassword(userId: string, plainPassword: string): Promise<void> {
    const passwordHash = await bcrypt.hash(plainPassword, SALT_ROUNDS);
    await this.userModel
      .updateOne({ _id: userId }, { $set: { passwordHash } })
      .exec();
  }

  async setGoogleProfile(
    googleId: string,
    displayName: string,
  ): Promise<UserDocument> {
    let user = await this.findByGoogleId(googleId);
    if (!user) {
      user = new this.userModel({ googleId, displayName });
      await user.save();
    } else if (!user.displayName && displayName) {
      user.displayName = displayName;
      await user.save();
    }
    return user;
  }

  async setFacebookProfile(
    facebookId: string,
    displayName: string,
  ): Promise<UserDocument> {
    let user = await this.findByFacebookId(facebookId);
    if (!user) {
      user = new this.userModel({ facebookId, displayName });
      await user.save();
    } else if (!user.displayName && displayName) {
      user.displayName = displayName;
      await user.save();
    }
    return user;
  }

  async upsertOtp(
    phoneNumber: string,
    purpose: OtpPurpose,
    plainCode: string,
    expiresAt: Date,
  ): Promise<void> {
    const codeHash = await bcrypt.hash(plainCode, SALT_ROUNDS);
    await this.otpModel
      .findOneAndUpdate(
        { phoneNumber, purpose },
        { $set: { codeHash, expiresAt } },
        { upsert: true, new: true },
      )
      .exec();
  }

  async verifyOtpAndDelete(
    phoneNumber: string,
    purpose: OtpPurpose,
    plainCode: string,
  ): Promise<boolean> {
    const record = await this.otpModel.findOne({ phoneNumber, purpose }).exec();
    if (!record || record.expiresAt < new Date()) {
      if (record) {
        await this.otpModel.deleteOne({ _id: record._id }).exec();
      }
      return false;
    }
    const ok = await bcrypt.compare(plainCode, record.codeHash);
    await this.otpModel.deleteOne({ _id: record._id }).exec();
    return ok;
  }

  async deleteOtp(phoneNumber: string, purpose: OtpPurpose): Promise<void> {
    await this.otpModel.deleteOne({ phoneNumber, purpose }).exec();
  }

  async getProfile(userId: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.mapUserProfile(user);
  }

  async getPublicProfile(userId: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const role =
      user.profileUseCase === 'list'
        ? 'landlord'
        : user.profileUseCase === 'rent'
          ? 'renter'
          : 'unknown';

    const listings =
      role === 'landlord'
        ? await this.listingModel
            .find({ ownerId: user._id })
            .sort({ createdAt: -1 })
            .limit(6)
            .exec()
        : [];

    return {
      id: user._id.toString(),
      role,
      displayName: user.displayName ?? null,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      profilePhotoUrl: user.profilePhotoUrl ?? null,
      bio: user.bio ?? null,
      occupation: user.occupation ?? null,
      location: {
        city: user.city ?? null,
        state: user.state ?? null,
        country: user.country ?? null,
      },
      verifiedInformation: {
        identity: user.profileCompleted ?? false,
        email: Boolean(user.email),
        phoneNumber: Boolean(user.phoneNumber),
      },
      joinedAt: user.createdAt ?? null,
      listings: listings.map((listing) => ({
        id: listing._id.toString(),
        title: listing.title,
        type: listing.type,
        address: listing.address,
        city: listing.city,
        state: listing.state,
        country: listing.country,
        price: listing.price,
        priceUnit: listing.priceUnit,
        rating: listing.rating,
        image: listing.images[0] ?? null,
      })),
    };
  }

  async updateProfileIntent(userId: string, useCase: 'rent' | 'list') {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: { profileUseCase: useCase } },
        { new: true },
      )
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.mapUserProfile(user);
  }

  async updateProfileBasic(
    userId: string,
    firstName: string,
    lastName: string,
    email?: string,
  ) {
    const displayName = `${firstName} ${lastName}`.trim();
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $set: {
            firstName,
            lastName,
            email: email?.toLowerCase(),
            displayName,
          },
        },
        { new: true },
      )
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.mapUserProfile(user);
  }

  async updateProfileDetails(
    userId: string,
    details: {
      bio?: string;
      occupation?: string;
      languages?: string[];
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      latitude?: number;
      longitude?: number;
      isMarried?: boolean;
      hasPets?: boolean;
      profilePhotoUrl?: string;
    },
  ) {
    const updatePayload = {
      ...details,
      languages: details.languages?.map((lang) => lang.trim()).filter(Boolean),
    };
    const user = await this.userModel
      .findByIdAndUpdate(userId, { $set: updatePayload }, { new: true })
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.mapUserProfile(user);
  }

  async updatePreferences(
    userId: string,
    notificationsEnabled: boolean,
    locationPermissionGranted: boolean,
  ) {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: { notificationsEnabled, locationPermissionGranted } },
        { new: true },
      )
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.mapUserProfile(user);
  }

  async completeProfile(userId: string) {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: { profileCompleted: true } },
        { new: true },
      )
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.mapUserProfile(user);
  }

  async updateProfilePhoto(userId: string, url: string, publicId?: string) {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $set: {
            profilePhotoUrl: url,
            profilePhotoPublicId: publicId,
          },
        },
        { new: true },
      )
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.mapUserProfile(user);
  }

  async searchLocations(query: string) {
    return this.locationSearchService.search(query);
  }
}
