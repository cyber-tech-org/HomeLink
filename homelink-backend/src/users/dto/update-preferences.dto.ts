import { IsBoolean } from 'class-validator';

export class UpdatePreferencesDto {
  @IsBoolean()
  notificationsEnabled: boolean;

  @IsBoolean()
  locationPermissionGranted: boolean;
}
