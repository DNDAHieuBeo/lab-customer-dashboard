
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
dotenv.config();
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
