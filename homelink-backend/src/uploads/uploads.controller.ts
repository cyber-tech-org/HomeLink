import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AccessTokenUser } from '../auth/strategies/jwt.strategy';
import { CreateUploadSignatureDto } from './dto/create-upload-signature.dto';
import { UploadsService } from './uploads.service';

type AuthRequest = Request & { user: AccessTokenUser };

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('signature')
  createSignature(@Req() req: AuthRequest, @Body() dto: CreateUploadSignatureDto) {
    return this.uploadsService.createSignature(req.user.userId, dto);
  }
}
