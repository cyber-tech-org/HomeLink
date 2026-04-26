import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

export function toObjectId(id: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid id');
  }
  return new Types.ObjectId(id);
}

export function isMongoDuplicateError(error: unknown) {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: number }).code === 11000,
  );
}
