import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { toObjectId } from '../common/utils/mongo.util';
import { buildPaginationMeta } from '../common/utils/pagination.util';
import { Listing, type ListingDocument } from '../explore/schemas/listing.schema';
import { User, type UserDocument } from '../users/schemas/user.schema';
import { Conversation, type ConversationDocument } from './schemas/conversation.schema';
import { Message, type MessageDocument } from './schemas/message.schema';
import type { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Listing.name)
    private readonly listingModel: Model<ListingDocument>,
  ) {}

  async createConversation(userId: string, participantId: string, listingId?: string) {
    if (userId === participantId) {
      throw new BadRequestException('Cannot create conversation with yourself');
    }

    const participantObjectId = toObjectId(participantId);
    const userObjectId = toObjectId(userId);
    const listingObjectId = listingId ? toObjectId(listingId) : undefined;

    const participantExists = await this.userModel.exists({ _id: participantObjectId });
    if (!participantExists) {
      throw new NotFoundException('Participant not found');
    }
    if (listingObjectId) {
      const listingExists = await this.listingModel.exists({ _id: listingObjectId });
      if (!listingExists) {
        throw new NotFoundException('Listing not found');
      }
    }

    const conversation = await this.findOrCreateConversation(
      userObjectId,
      participantObjectId,
      listingObjectId,
    );
    return this.serializeConversation(conversation, userObjectId);
  }

  async listConversations(userId: string, page = 1, limit = 20) {
    const userObjectId = toObjectId(userId);
    const skip = (page - 1) * limit;

    const [total, conversations] = await Promise.all([
      this.conversationModel
        .countDocuments({ participantIds: userObjectId })
        .exec(),
      this.conversationModel
        .find({ participantIds: userObjectId })
        .sort({ lastMessageAt: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
    ]);

    const conversationIds = conversations.map((c) => c._id);
    const otherParticipantIds = conversations
      .map((c) =>
        c.participantIds.find((id) => id.toString() !== userObjectId.toString()),
      )
      .filter((id): id is Types.ObjectId => Boolean(id));

    const [users, unreadCounts] = await Promise.all([
      this.userModel
        .find({ _id: { $in: otherParticipantIds } })
        .select('displayName firstName lastName profilePhotoUrl')
        .lean()
        .exec(),
      this.messageModel.aggregate<{ _id: Types.ObjectId; total: number }>([
        {
          $match: {
            conversationId: { $in: conversationIds },
            senderId: { $ne: userObjectId },
            readByUserIds: { $ne: userObjectId },
          },
        },
        { $group: { _id: '$conversationId', total: { $sum: 1 } } },
      ]),
    ]);

    const userMap = new Map(users.map((u) => [u._id.toString(), u]));
    const unreadMap = new Map(
      unreadCounts.map((c) => [c._id.toString(), c.total]),
    );

    return {
      pagination: buildPaginationMeta(page, limit, total),
      conversations: conversations.map((conversation) => {
        const serialized = this.serializeConversation(conversation, userObjectId);
        const other = serialized.otherParticipantId
          ? userMap.get(serialized.otherParticipantId)
          : undefined;
        return {
          ...serialized,
          otherParticipant: other
            ? {
                id: other._id.toString(),
                displayName: other.displayName ?? null,
                firstName: other.firstName ?? null,
                lastName: other.lastName ?? null,
                profilePhotoUrl: other.profilePhotoUrl ?? null,
              }
            : null,
          unreadCount: unreadMap.get(conversation._id.toString()) ?? 0,
        };
      }),
    };
  }

  async getConversationMessages(
    userId: string,
    conversationId: string,
    page = 1,
    limit = 30,
  ) {
    const userObjectId = toObjectId(userId);
    const conversation = await this.assertConversationParticipant(
      conversationId,
      userObjectId,
    );

    const skip = (page - 1) * limit;
    const [total, messages] = await Promise.all([
      this.messageModel.countDocuments({ conversationId: conversation._id }).exec(),
      this.messageModel
        .find({ conversationId: conversation._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
    ]);

    return {
      conversation: this.serializeConversation(conversation, userObjectId),
      pagination: buildPaginationMeta(page, limit, total),
      messages: messages.reverse().map((message) => this.serializeMessage(message)),
    };
  }

  async sendMessage(userId: string, dto: SendMessageDto) {
    const senderObjectId = toObjectId(userId);
    const text = dto.text?.trim() ?? '';
    const attachments = (dto.attachments ?? []).map((item) => item.trim()).filter(Boolean);
    if (!text && !attachments.length) {
      throw new BadRequestException('Message text or attachments is required');
    }

    let conversation: ConversationDocument | null = null;

    if (dto.conversationId) {
      conversation = await this.assertConversationParticipant(
        dto.conversationId,
        senderObjectId,
      );
    } else {
      if (!dto.recipientId) {
        throw new BadRequestException(
          'recipientId is required when conversationId is not provided',
        );
      }
      if (dto.recipientId === userId) {
        throw new BadRequestException('Cannot message yourself');
      }
      const recipientObjectId = toObjectId(dto.recipientId);
      const listingObjectId = dto.listingId ? toObjectId(dto.listingId) : undefined;
      conversation = await this.findOrCreateConversation(
        senderObjectId,
        recipientObjectId,
        listingObjectId,
      );
    }

    const message = await this.messageModel.create({
      conversationId: conversation._id,
      senderId: senderObjectId,
      text,
      attachments,
      readByUserIds: [senderObjectId],
    });

    await this.conversationModel
      .updateOne(
        { _id: conversation._id },
        {
          $set: {
            lastMessageText: text || '[attachment]',
            lastMessageSenderId: senderObjectId,
            lastMessageAt: message.createdAt ?? new Date(),
          },
        },
      )
      .exec();

    const updatedConversation = await this.conversationModel
      .findById(conversation._id)
      .orFail()
      .exec();

    return {
      conversation: this.serializeConversation(updatedConversation, senderObjectId),
      message: this.serializeMessage(message),
      participantIds: updatedConversation.participantIds.map((id) => id.toString()),
    };
  }

  async markConversationRead(userId: string, conversationId: string) {
    const userObjectId = toObjectId(userId);
    const conversation = await this.assertConversationParticipant(
      conversationId,
      userObjectId,
    );

    await this.messageModel
      .updateMany(
        {
          conversationId: conversation._id,
          senderId: { $ne: userObjectId },
          readByUserIds: { $ne: userObjectId },
        },
        { $addToSet: { readByUserIds: userObjectId } },
      )
      .exec();

    return {
      conversationId: conversation._id.toString(),
      participantIds: conversation.participantIds.map((id) => id.toString()),
    };
  }

  private async findOrCreateConversation(
    userA: Types.ObjectId,
    userB: Types.ObjectId,
    listingId?: Types.ObjectId,
  ) {
    const query: Record<string, unknown> = {
      participantIds: { $all: [userA, userB], $size: 2 },
      listingId: listingId ?? { $exists: false },
    };
    let conversation = await this.conversationModel.findOne(query).exec();
    if (!conversation) {
      conversation = await this.conversationModel.create({
        participantIds: [userA, userB],
        listingId,
        lastMessageText: '',
      });
    }
    return conversation;
  }

  private async assertConversationParticipant(
    conversationId: string,
    userId: Types.ObjectId,
  ) {
    const conversation = await this.conversationModel
      .findById(conversationId)
      .exec();
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }
    const isParticipant = conversation.participantIds.some(
      (id) => id.toString() === userId.toString(),
    );
    if (!isParticipant) {
      throw new NotFoundException('Conversation not found');
    }
    return conversation;
  }

  private serializeConversation(
    conversation: ConversationDocument,
    currentUserId: Types.ObjectId,
  ) {
    const otherParticipant = conversation.participantIds.find(
      (id) => id.toString() !== currentUserId.toString(),
    );
    return {
      id: conversation._id.toString(),
      otherParticipantId: otherParticipant?.toString() ?? null,
      participantIds: conversation.participantIds.map((id) => id.toString()),
      listingId: conversation.listingId?.toString() ?? null,
      lastMessageText: conversation.lastMessageText,
      lastMessageSenderId: conversation.lastMessageSenderId?.toString() ?? null,
      lastMessageAt: conversation.lastMessageAt ?? null,
      updatedAt: conversation.updatedAt ?? null,
    };
  }

  private serializeMessage(message: MessageDocument) {
    return {
      id: message._id.toString(),
      conversationId: message.conversationId.toString(),
      senderId: message.senderId.toString(),
      text: message.text,
      attachments: message.attachments,
      readByUserIds: message.readByUserIds.map((id) => id.toString()),
      createdAt: message.createdAt ?? null,
    };
  }

}
