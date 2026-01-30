import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.use(cookieParser());
    app.setGlobalPrefix('api');

    // Prefix-insurer middleware: ensures that even if the proxy strips /api, 
    // it reaches the prefixed router correctly.
    app.use((req: any, res: any, next: any) => {
      const isUpload = req.path.startsWith('/uploads');

      if (isUpload) return next();

      let targetPath = req.path;

      // Handle the 'marketing' segment from legacy admin paths
      if (targetPath.startsWith('/marketing/')) {
        targetPath = targetPath.replace('/marketing/', '/');
      }

      // Ensure it starts with /api
      if (!targetPath.startsWith('/api')) {
        targetPath = `/api${targetPath}`;
      }

      // If it became something like /api/marketing (due to double match), fix it
      if (targetPath.startsWith('/api/marketing/')) {
        targetPath = targetPath.replace('/api/marketing/', '/api/');
      }

      // Preserve query parameters by only replacing the path portion of the URL
      const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
      req.url = targetPath + queryString;

      next();
    });

    // Logging middleware for debugging routing issues
    app.use((req, res, next) => {
      const isUpload = req.originalUrl.includes('/uploads/');
      if (!isUpload) {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${req.url}`);
      }
      next();
    });

    // Serve static files from uploads directory
    app.useStaticAssets(join(process.cwd(), 'uploads'), {
      prefix: '/uploads',
    });

    app.enableCors({
      origin: [
        'http://127.0.0.1:3000',
        'http://localhost:3000',
        'http://127.0.0.1:3002',
        'http://localhost:3002',
        'https://admin.workit.co.ke',
        'https://workit.co.ke',
        'https://api.workit.co.ke',
        'https://store.workit.co.ke',
      ],
      credentials: true,
    });

    // Swagger setup
    const config = new DocumentBuilder()
      .setTitle('Workit E-commerce API')
      .setDescription('API documentation for Workit platform')
      .setVersion('1.0')
      .addBearerAuth()
      .addCookieAuth('better-auth.session_token')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.PORT ?? 3001;
    const dbUrl = process.env.DATABASE_URL;
    const uploadsPath = join(process.cwd(), 'uploads');

    console.log(`🚀 Service starting...`);
    console.log(`📍 Port: ${port}`);
    console.log(`📂 Static Assets: ${uploadsPath}`);

    try {
      const fs = require('fs');
      if (fs.existsSync(uploadsPath)) {
        const files = fs.readdirSync(uploadsPath);
        console.log(`📦 Assets found: ${files.length} items`);
      } else {
        console.log(`⚠️  Warning: uploads folder does not exist at ${uploadsPath}`);
      }
    } catch (e) {
      console.log(`⚠️  Failed to check assets folder: ${e.message}`);
    }

    console.log(`🔑 INTERNAL_API_KEY: ${process.env.INTERNAL_API_KEY ? 'Configured' : 'NOT SET'}`);
    console.log(`🗄️ DATABASE_URL: ${dbUrl ? `${dbUrl.split('@')[1] || 'Found'}` : 'NOT FOUND - using default local'}`);

    await app.listen(port);
    console.log(`✅ Backend is running and ready.`);
  } catch (err) {
    console.error('❌ CRITICAL: Error during bootstrap:', err);
    process.exit(1);
  }
}
bootstrap();
