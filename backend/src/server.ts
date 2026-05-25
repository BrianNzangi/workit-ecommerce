import dotenv from 'dotenv';
dotenv.config();

import { buildApp } from './app.js';
import { ensureTypesenseSchema, isTypesenseEnabled } from './services/search/typesense.client.js';

const start = async () => {

  if (isTypesenseEnabled()) {
    try {
      await ensureTypesenseSchema();
      console.log('Typesense schema ready');
    } catch (err) {
      console.error('Failed to initialize Typesense schema:', err);
    }
  }

  const app = await buildApp();
  const port = Number(process.env.PORT) || 3002;

  try {
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Backend v2 (DDD) ready at http://localhost:${port}`);
  } catch (err) {
    console.error('STARTUP ERROR:', err);
    app.log.error(err);
    process.exit(1);
  }
};

start();
