import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.use(cookieParser());

    // Serve static files from uploads directory
    app.useStaticAssets(join(__dirname, '..', 'uploads'), {
      prefix: '/uploads/',
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
      ],
      credentials: true,
    });

    const port = process.env.PORT ?? 3001;
    await app.listen(port);
    console.log(`Backend is running on port ${port}`);
  } catch (err) {
    console.error('Error during bootstrap:', err);
    process.exit(1);
  }
}
bootstrap();
