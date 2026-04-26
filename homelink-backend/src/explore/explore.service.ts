import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { AccessTokenUser } from '../auth/strategies/jwt.strategy';
import { buildPaginationMeta } from '../common/utils/pagination.util';
import { UsersService } from '../users/users.service';
import type { ExploreTab, ExploreView } from './dto/get-explore.dto';
import { Listing, ListingDocument, type ListingType } from './schemas/listing.schema';

type ExploreCard = {
  id: string;
  title: string;
  type: ListingType;
  address: string;
  city: string;
  state: string;
  country: string;
  price: number;
  priceUnit: string;
  rating: number;
  distanceKm: number | null;
  image: string | null;
  isPopular: boolean;
  latitude: number;
  longitude: number;
};

@Injectable()
export class ExploreService {
  constructor(
    @InjectModel(Listing.name) private readonly listingModel: Model<ListingDocument>,
    private readonly usersService: UsersService,
  ) {}

  async getExploreFeed(
    user: AccessTokenUser,
    tab: ExploreTab = 'popular',
    page = 1,
    limit = 10,
    search?: string,
    view: ExploreView = 'list',
  ) {
    const profile = await this.usersService.getProfile(user.userId);
    const query = this.buildExploreQuery(profile, tab, search);
    const { total, listings } = await this.fetchListings(query, page, limit);

    const userLat = profile.location.latitude;
    const userLng = profile.location.longitude;

    const cards = listings.map((item) =>
      this.mapListing(item, typeof userLat === 'number' ? userLat : null, typeof userLng === 'number' ? userLng : null),
    );

    return {
      user: {
        id: profile.id,
        displayName: profile.displayName,
        firstName: profile.firstName,
        city: profile.location.city,
        state: profile.location.state,
      },
      activeTab: tab,
      activeView: view,
      search: search?.trim() || null,
      pagination: buildPaginationMeta(page, limit, total),
      listings: cards,
      mapMarkers: this.toMapMarkers(cards),
    };
  }

  private buildExploreQuery(
    profile: Awaited<ReturnType<UsersService['getProfile']>>,
    tab: ExploreTab,
    search?: string,
  ): Record<string, unknown> {
    const query: Record<string, unknown> = {};

    if (tab !== 'popular') {
      query.type = tab;
    } else {
      query.isPopular = true;
    }

    const city = profile.location.city ?? undefined;
    const state = profile.location.state ?? undefined;
    if (city) {
      query.city = city;
    } else if (state) {
      query.state = state;
    }

    const trimmedSearch = search?.trim();
    if (trimmedSearch) {
      const regex = new RegExp(trimmedSearch, 'i');
      query.$or = [
        { title: regex },
        { address: regex },
        { city: regex },
        { state: regex },
        { type: regex },
      ];
    }

    return query;
  }

  private async fetchListings(
    query: Record<string, unknown>,
    page: number,
    limit: number,
  ) {
    const skip = (page - 1) * limit;
    const [total, listings] = await Promise.all([
      this.listingModel.countDocuments(query).exec(),
      this.listingModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
    ]);

    return { total, listings };
  }

  private mapListing(
    item: ListingDocument,
    userLat: number | null,
    userLng: number | null,
  ): ExploreCard {
    return {
      id: item._id.toString(),
      title: item.title,
      type: item.type,
      address: item.address,
      city: item.city,
      state: item.state,
      country: item.country,
      price: item.price,
      priceUnit: item.priceUnit,
      rating: item.rating,
      distanceKm:
        userLat !== null && userLng !== null
          ? this.calculateDistanceKm(userLat, userLng, item.latitude, item.longitude)
          : null,
      image: item.images[0] ?? null,
      isPopular: item.isPopular,
      latitude: item.latitude,
      longitude: item.longitude,
    };
  }

  private calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((earthRadiusKm * c).toFixed(1));
  }

  private toMapMarkers(cards: ExploreCard[]) {
    return cards.map((card) => ({
      listingId: card.id,
      title: card.title,
      latitude: card.latitude,
      longitude: card.longitude,
      price: card.price,
      priceUnit: card.priceUnit,
    }));
  }
}
