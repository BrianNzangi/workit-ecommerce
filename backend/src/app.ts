import Fastify from 'fastify';
import autoload from '@fastify/autoload';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';

import { storageService } from './lib/storage.js';
import { bootstrapContainer } from './infrastructure/di/bootstrap.js';
import { isTypesenseEnabled } from './services/search/typesense.client.js';
import { db } from './lib/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const buildApp = async () => {
  // ─── Bootstrap DI container before anything else ─────────────────────────
  bootstrapContainer();

  const app = Fastify({
    logger: true,
    routerOptions: {
      ignoreTrailingSlash: true,
    },
  }).withTypeProvider<ZodTypeProvider>();

  // Proxy route: serve files from object storage at /uploads/:filename
  // Falls back to local filesystem, then to a generated placeholder SVG.
  app.get('/uploads/:filename', async (request, reply) => {
    const { filename } = request.params as { filename: string };
    try {
      const { stream, contentType, contentLength } = await storageService.getObject(filename);
      reply.header('Content-Type', contentType || 'application/octet-stream');
      if (contentLength) {
        reply.header('Content-Length', contentLength);
      }
      reply.header('Cache-Control', 'public, max-age=31536000, immutable');
      return reply.send(stream);
    } catch (err: any) {
      if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
        // Try local filesystem fallback (useful for development / migration)
        try {
          const { join } = await import('path');
          const { createReadStream, existsSync } = await import('fs');
          const localPath = join(process.cwd(), 'uploads', filename);
          if (existsSync(localPath)) {
            const stream = createReadStream(localPath);
            const mime = filename.endsWith('.png') ? 'image/png'
              : filename.endsWith('.webp') ? 'image/webp'
              : filename.endsWith('.jpg') || filename.endsWith('.jpeg') ? 'image/jpeg'
              : filename.endsWith('.svg') ? 'image/svg+xml'
              : 'application/octet-stream';
            reply.header('Content-Type', mime);
            reply.header('Cache-Control', 'public, max-age=3600');
            return reply.send(stream);
          }
        } catch { /* local fallback not available */ }

        // File not found in S3 or local — return a generated SVG placeholder so the
        // page layout is preserved. The admin should re-upload the image to restore it.
        const label = filename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ').replace(/^\d+-/, '');
        const placeholder = Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
            <rect width="800" height="800" fill="#f3f4f6"/>
            <rect x="300" y="300" width="200" height="200" rx="16" fill="#d1d5db"/>
            <path d="M370 420 L430 420 M400 380 L400 440" stroke="#9ca3af" stroke-width="12" stroke-linecap="round"/>
            <text x="400" y="540" font-family="system-ui,sans-serif" font-size="24" fill="#6b7280" text-anchor="middle">${label}</text>
            <text x="400" y="570" font-family="system-ui,sans-serif" font-size="14" fill="#9ca3af" text-anchor="middle">Missing image</text>
          </svg>`
        );
        reply.header('Content-Type', 'image/svg+xml');
        reply.header('Cache-Control', 'public, max-age=300');
        return reply.send(placeholder);
      }
      app.log.error({ err, filename }, 'Storage service error');
      throw err;
    }
  });

  // Health checks
  const startTime = Date.now();

  app.get('/health/live', async () => ({ status: 'ok', timestamp: new Date() }));
  app.get('/health/ready', async () => ({ status: 'ok', timestamp: new Date() }));

  app.get('/health', async (_request, reply) => {
    const checks: Record<string, any> = {};

    checks.uptime = Math.floor((Date.now() - startTime) / 1000);
    checks.timestamp = new Date().toISOString();

    try {
      await db.execute(db.sql`SELECT 1`);
      checks.database = { status: 'ok' };
    } catch (err: any) {
      checks.database = { status: 'error', message: err?.message };
    }

    if (isTypesenseEnabled()) {
      checks.typesense = { status: 'configured' };
    } else {
      checks.typesense = { status: 'disabled' };
    }

    const allOk = checks.database?.status === 'ok';

    return reply.code(allOk ? 200 : 503).send({
      status: allOk ? 'ok' : 'degraded',
      checks,
    });
  });

  app.get('/test-deploy', async () => ({ status: 'v2-ddd', timestamp: new Date() }));
  app.get('/api', async () => ({
    status: 'ok',
    service: 'workit-backend',
    version: '2.0.0',
    architecture: 'DDD',
    routes: {
      auth: '/api/auth',
      products: '/api/products',
      store: '/store',
    },
  }));

  // Set Zod compilers
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.addHook('onRequest', async (request) => {
    app.log.debug(`[DEBUG] Incoming Request: ${request.method} ${request.url}`);
  });

  // Storage check
  const requireStorageOnStartup =
    process.env.STORAGE_REQUIRED === 'true' || process.env.NODE_ENV === 'production';

  try {
    await storageService.ensureBucketExists();
  } catch (err) {
    if (requireStorageOnStartup) {
      throw err;
    }
    app.log.warn({ err }, 'Storage unavailable during startup; continuing without upload support');
  }

  // Register all plugins (same as backend)
  await app.register(autoload, {
    dir: join(__dirname, 'plugins'),
  });

  // Register all legacy modules (same routes as backend)
  const { appModules } = await import('./modules/index.js');
  await app.register(appModules);

  await app.ready();

  if (process.env.PRINT_ROUTES === 'true') {
    app.log.info(`\n${app.printRoutes()}`);
  }

  return app;
};
