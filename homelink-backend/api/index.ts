import 'dotenv/config';
import type { INestApplication } from '@nestjs/common';
import { createApp } from '../src/app.factory';

let cachedApp: INestApplication | null = null;

async function getExpressHandler() {
  if (!cachedApp) {
    cachedApp = await createApp();
    await cachedApp.init();
  }

  return cachedApp.getHttpAdapter().getInstance();
}

export default async function handler(req: unknown, res: unknown) {
  const expressHandler = await getExpressHandler();
  return expressHandler(req, res);
}
