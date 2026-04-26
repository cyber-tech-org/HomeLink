import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadsService {
  constructor(private readonly config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: this.config.getOrThrow<string>('CLOUDINARY_API_SECRET'),
      secure: true,
    });
  }

  createSignature(
    userId: string,
    input: {
      folderType: 'profile' | 'chat' | 'listing' | 'misc';
      resourceType?: 'image' | 'video' | 'raw' | 'auto';
      conversationId?: string;
      listingId?: string;
    },
  ) {
    const folder = this.buildFolder(userId, input);
    const timestamp = Math.floor(Date.now() / 1000);
    const resourceType = input.resourceType ?? 'auto';
    const paramsToSign = {
      folder,
      resource_type: resourceType,
      timestamp,
    };
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      this.config.getOrThrow<string>('CLOUDINARY_API_SECRET'),
    );

    return {
      cloudName: this.config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      apiKey: this.config.getOrThrow<string>('CLOUDINARY_API_KEY'),
      timestamp,
      signature,
      folder,
      resourceType,
    };
  }

  private buildFolder(
    userId: string,
    input: {
      folderType: 'profile' | 'chat' | 'listing' | 'misc';
      conversationId?: string;
      listingId?: string;
    },
  ) {
    const root = this.config.get<string>('CLOUDINARY_UPLOAD_FOLDER', 'homelink');
    if (input.folderType === 'profile') {
      return `${root}/profile/${userId}`;
    }
    if (input.folderType === 'chat') {
      if (!input.conversationId) {
        throw new BadRequestException(
          'conversationId is required for chat uploads',
        );
      }
      return `${root}/chat/${input.conversationId}`;
    }
    if (input.folderType === 'listing') {
      if (!input.listingId) {
        throw new BadRequestException('listingId is required for listing uploads');
      }
      return `${root}/listings/${input.listingId}`;
    }
    return `${root}/misc/${userId}`;
  }
}
