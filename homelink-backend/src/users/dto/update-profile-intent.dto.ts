import { IsIn } from 'class-validator';

export class UpdateProfileIntentDto {
  @IsIn(['rent', 'list'])
  useCase: 'rent' | 'list';
}
