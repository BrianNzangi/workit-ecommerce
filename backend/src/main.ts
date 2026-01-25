import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    app.enableCors({
      origin: ['http://127.0.0.1:3000', 'http://localhost:3000', 'http://127.0.0.1:3002', 'http://localhost:3002'],
      credentials: true,
    });
    const port = process.env.PORT ?? 3001;
    await app.listen(port);
    console.log(`Backend is running on port ${port}`);
  } catch (err) {
    console.error('Error during backend bootstrap:', err);
    process.exit(1);
  }
}
bootstrap();
