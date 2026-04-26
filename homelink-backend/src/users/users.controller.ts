import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AccessTokenUser } from '../auth/strategies/jwt.strategy';
import { SearchLocationDto } from './dto/search-location.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdateProfileBasicDto } from './dto/update-profile-basic.dto';
import { UpdateProfileDetailsDto } from './dto/update-profile-details.dto';
import { UpdateProfileIntentDto } from './dto/update-profile-intent.dto';
import { UpdateProfilePhotoDto } from './dto/update-profile-photo.dto';
import { UsersService } from './users.service';

type AuthRequest = Request & { user: AccessTokenUser };

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@Req() req: AuthRequest) {
    return this.usersService.getProfile(req.user.userId);
  }

  @Get(':userId/profile')
  getPublicProfile(@Param('userId') userId: string) {
    return this.usersService.getPublicProfile(userId);
  }

  @Patch('me/profile-intent')
  updateProfileIntent(@Req() req: AuthRequest, @Body() dto: UpdateProfileIntentDto) {
    return this.usersService.updateProfileIntent(req.user.userId, dto.useCase);
  }

  @Patch('me/basic')
  updateBasicInfo(@Req() req: AuthRequest, @Body() dto: UpdateProfileBasicDto) {
    return this.usersService.updateProfileBasic(
      req.user.userId,
      dto.firstName,
      dto.lastName,
      dto.email,
    );
  }

  @Patch('me/details')
  updateDetails(@Req() req: AuthRequest, @Body() dto: UpdateProfileDetailsDto) {
    return this.usersService.updateProfileDetails(req.user.userId, dto);
  }

  @Patch('me/profile-photo')
  updateProfilePhoto(@Req() req: AuthRequest, @Body() dto: UpdateProfilePhotoDto) {
    return this.usersService.updateProfilePhoto(
      req.user.userId,
      dto.url,
      dto.publicId,
    );
  }

  @Patch('me/preferences')
  updatePreferences(@Req() req: AuthRequest, @Body() dto: UpdatePreferencesDto) {
    return this.usersService.updatePreferences(
      req.user.userId,
      dto.notificationsEnabled,
      dto.locationPermissionGranted,
    );
  }

  @Post('me/complete-profile')
  completeProfile(@Req() req: AuthRequest) {
    return this.usersService.completeProfile(req.user.userId);
  }

  @Get('location/search')
  searchLocation(@Query() query: SearchLocationDto) {
    return this.usersService.searchLocations(query.query);
  }

  @Get('options')
  getProfileOptions() {
    return {
      useCases: [
        { value: 'rent', label: 'Rent an apartment' },
        { value: 'list', label: 'List an apartment' },
      ],
      languages: [
        'Igbo',
        'Yoruba',
        'Hausa',
        'English',
        'French',
        'Arabic',
        'Spanish',
      ],
      maritalStatuses: [
        { value: true, label: 'Yes, I am married' },
        { value: false, label: "No, I'm not" },
      ],
      petChoices: [
        { value: true, label: 'Yes, I have pets' },
        { value: false, label: "No, I'm not interested" },
      ],
    };
  }
}
