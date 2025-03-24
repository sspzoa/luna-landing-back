// src/index.ts
import { startIntegratedServer } from './server';

startIntegratedServer({
  port: Number(process.env.PORT) || 3000,
  publicDir: process.env.PUBLIC_DIR || undefined,
  cronIntervalMs: 30 * 60 * 1000,
});
