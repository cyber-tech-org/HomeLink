import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getGreetings(): { message: string } {
    return { message: 'Welcome to Homelink Backend!' };
  }
}
