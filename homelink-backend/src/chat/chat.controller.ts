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
import { ChatPaginationDto } from './dto/chat-pagination.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatService } from './chat.service';

type AuthRequest = Request & { user: AccessTokenUser };

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  createConversation(@Req() req: AuthRequest, @Body() dto: CreateConversationDto) {
    return this.chatService.createConversation(
      req.user.userId,
      dto.participantId,
      dto.listingId,
    );
  }

  @Get('conversations')
  listConversations(@Req() req: AuthRequest, @Query() query: ChatPaginationDto) {
    return this.chatService.listConversations(
      req.user.userId,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  @Get('conversations/:conversationId/messages')
  getMessages(
    @Req() req: AuthRequest,
    @Param('conversationId') conversationId: string,
    @Query() query: ChatPaginationDto,
  ) {
    return this.chatService.getConversationMessages(
      req.user.userId,
      conversationId,
      query.page ?? 1,
      query.limit ?? 30,
    );
  }

  @Post('messages')
  sendMessage(@Req() req: AuthRequest, @Body() dto: SendMessageDto) {
    return this.chatService.sendMessage(req.user.userId, dto);
  }

  @Patch('conversations/:conversationId/read')
  markRead(@Req() req: AuthRequest, @Param('conversationId') conversationId: string) {
    return this.chatService.markConversationRead(req.user.userId, conversationId);
  }
}
