import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

export async function createApp() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const corsOrigin = config.get<string>('CORS_ORIGIN');

  app.enableCors(
    corsOrigin
      ? {
          origin: corsOrigin
            .split(',')
            .map((origin) => origin.trim())
            .filter(Boolean),
          credentials: true,
        }
      : undefined,
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  return app;
}
