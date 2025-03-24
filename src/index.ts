// src/index.ts
import { startServer } from './server';

startServer({
  cronIntervalMs: 30 * 60 * 1000,
});
