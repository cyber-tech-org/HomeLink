import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { isMongoDuplicateError, toObjectId } from '../common/utils/mongo.util';
import { buildPaginationMeta } from '../common/utils/pagination.util';
import {
  Listing,
  type ListingDocument,
} from '../explore/schemas/listing.schema';
import {
  WishlistFolder,
  type WishlistFolderDocument,
} from './schemas/wishlist-folder.schema';
import {
  WishlistItem,
  type WishlistItemDocument,
} from './schemas/wishlist-item.schema';

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(WishlistFolder.name)
    private readonly folderModel: Model<WishlistFolderDocument>,
    @InjectModel(WishlistItem.name)
    private readonly itemModel: Model<WishlistItemDocument>,
    @InjectModel(Listing.name)
    private readonly listingModel: Model<ListingDocument>,
  ) {}

  async listFolders(userId: string) {
    const userObjectId = toObjectId(userId);
    const folders = await this.folderModel
      .find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const counts = await this.itemModel.aggregate<{
      _id: Types.ObjectId;
      total: number;
    }>([
      { $match: { userId: userObjectId } },
      { $group: { _id: '$folderId', total: { $sum: 1 } } },
    ]);

    const countMap = new Map(
      counts.map((entry) => [entry._id.toString(), entry.total]),
    );

    return folders.map((folder) => ({
      id: folder._id.toString(),
      name: folder.name,
      listingsCount: countMap.get(folder._id.toString()) ?? 0,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
    }));
  }

  async createFolder(userId: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new BadRequestException('Folder name is required');
    }
    try {
      const folder = await this.folderModel.create({
        userId: toObjectId(userId),
        name: trimmed,
      });
      return {
        id: folder._id.toString(),
        name: folder.name,
        listingsCount: 0,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
      };
    } catch (error) {
      if (isMongoDuplicateError(error)) {
        throw new ConflictException('Folder name already exists');
      }
      throw error;
    }
  }

  async renameFolder(userId: string, folderId: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new BadRequestException('Folder name is required');
    }
    await this.assertFolderOwnership(userId, folderId);
    try {
      const folder = await this.folderModel
        .findByIdAndUpdate(folderId, { $set: { name: trimmed } }, { new: true })
        .exec();
      if (!folder) {
        throw new NotFoundException('Folder not found');
      }
      return {
        id: folder._id.toString(),
        name: folder.name,
        updatedAt: folder.updatedAt,
      };
    } catch (error) {
      if (isMongoDuplicateError(error)) {
        throw new ConflictException('Folder name already exists');
      }
      throw error;
    }
  }

  async deleteFolder(userId: string, folderId: string) {
    await this.assertFolderOwnership(userId, folderId);
    await Promise.all([
      this.folderModel.deleteOne({ _id: folderId }).exec(),
      this.itemModel.deleteMany({ userId: toObjectId(userId), folderId }).exec(),
    ]);
    return { message: 'Folder deleted' };
  }

  async addListingToFolder(userId: string, folderId: string, listingId: string) {
    await this.assertFolderOwnership(userId, folderId);
    const listing = await this.listingModel.findById(listingId).exec();
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }
    try {
      await this.itemModel.create({
        userId: toObjectId(userId),
        folderId: toObjectId(folderId),
        listingId: toObjectId(listingId),
      });
    } catch (error) {
      if (!isMongoDuplicateError(error)) {
        throw error;
      }
    }

    return {
      message: 'Listing saved to folder',
      listingId: listing._id.toString(),
      folderId,
    };
  }

  async removeListingFromFolder(
    userId: string,
    folderId: string,
    listingId: string,
  ) {
    await this.assertFolderOwnership(userId, folderId);
    await this.itemModel
      .deleteOne({
        userId: toObjectId(userId),
        folderId: toObjectId(folderId),
        listingId: toObjectId(listingId),
      })
      .exec();

    return { message: 'Listing removed from folder', listingId, folderId };
  }

  async getFolderListings(
    userId: string,
    folderId: string,
    page = 1,
    limit = 10,
  ) {
    const folder = await this.assertFolderOwnership(userId, folderId);
    const skip = (page - 1) * limit;
    const [total, items] = await Promise.all([
      this.itemModel
        .countDocuments({ userId: toObjectId(userId), folderId: toObjectId(folderId) })
        .exec(),
      this.itemModel
        .find({ userId: toObjectId(userId), folderId: toObjectId(folderId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate<{ listingId: ListingDocument }>('listingId')
        .exec(),
    ]);

    return {
      folder: {
        id: folder._id.toString(),
        name: folder.name,
      },
      pagination: buildPaginationMeta(page, limit, total),
      listings: items
        .filter((entry) => entry.listingId)
        .map((entry) => ({
          id: entry.listingId._id.toString(),
          title: entry.listingId.title,
          type: entry.listingId.type,
          address: entry.listingId.address,
          city: entry.listingId.city,
          state: entry.listingId.state,
          country: entry.listingId.country,
          price: entry.listingId.price,
          priceUnit: entry.listingId.priceUnit,
          rating: entry.listingId.rating,
          image: entry.listingId.images[0] ?? null,
          savedAt: entry.createdAt,
        })),
    };
  }

  async foldersForListing(userId: string, listingId: string) {
    const listing = await this.listingModel.findById(listingId).exec();
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }
    const userObjectId = toObjectId(userId);
    const [folders, saved] = await Promise.all([
      this.folderModel.find({ userId: userObjectId }).sort({ createdAt: -1 }).lean().exec(),
      this.itemModel
        .find({ userId: userObjectId, listingId: toObjectId(listingId) })
        .lean()
        .exec(),
    ]);
    const savedFolderSet = new Set(saved.map((item) => item.folderId.toString()));
    return folders.map((folder) => ({
      id: folder._id.toString(),
      name: folder.name,
      selected: savedFolderSet.has(folder._id.toString()),
    }));
  }

  private async assertFolderOwnership(userId: string, folderId: string) {
    const folder = await this.folderModel
      .findOne({ _id: folderId, userId: toObjectId(userId) })
      .exec();
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }
    return folder;
  }

}
