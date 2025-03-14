// src/index.ts
import { startServer } from './server';

startServer({
  cronIntervalMs: 10 * 60 * 1000,
});
