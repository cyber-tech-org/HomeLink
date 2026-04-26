import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { JWT_TYP_ACCESS } from '../auth/auth.constants';
import { ChatService } from './chat.service';
import type { SendMessageDto } from './dto/send-message.dto';

type JwtPayload = {
  sub: string;
  typ?: string;
};

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: true, credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly chatService: ChatService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
      });
      if (payload.typ !== JWT_TYP_ACCESS || !payload.sub) {
        client.disconnect();
        return;
      }

      client.data.userId = payload.sub;
      client.join(this.userRoom(payload.sub));
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(_client: Socket) {}

  @SubscribeMessage('chat:send')
  async onSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: SendMessageDto,
  ) {
    const userId = client.data.userId as string | undefined;
    if (!userId) {
      return { ok: false, message: 'Unauthorized' };
    }
    const result = await this.chatService.sendMessage(userId, body);
    for (const participantId of result.participantIds) {
      this.server.to(this.userRoom(participantId)).emit('chat:new_message', result);
    }
    return { ok: true, data: result };
  }

  @SubscribeMessage('chat:typing')
  onTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    body: { conversationId: string; recipientId: string; isTyping: boolean },
  ) {
    const userId = client.data.userId as string | undefined;
    if (!userId) {
      return { ok: false, message: 'Unauthorized' };
    }
    this.server.to(this.userRoom(body.recipientId)).emit('chat:typing', {
      conversationId: body.conversationId,
      senderId: userId,
      isTyping: body.isTyping,
    });
    return { ok: true };
  }

  @SubscribeMessage('chat:read')
  async onRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { conversationId: string },
  ) {
    const userId = client.data.userId as string | undefined;
    if (!userId) {
      return { ok: false, message: 'Unauthorized' };
    }
    const result = await this.chatService.markConversationRead(
      userId,
      body.conversationId,
    );
    for (const participantId of result.participantIds) {
      this.server.to(this.userRoom(participantId)).emit('chat:read', {
        conversationId: result.conversationId,
        readerId: userId,
      });
    }
    return { ok: true };
  }

  private extractToken(client: Socket) {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.trim()) {
      return authToken.trim();
    }
    const header = client.handshake.headers.authorization;
    if (typeof header === 'string' && header.startsWith('Bearer ')) {
      return header.slice(7).trim();
    }
    return null;
  }

  private userRoom(userId: string) {
    return `user:${userId}`;
  }
}
