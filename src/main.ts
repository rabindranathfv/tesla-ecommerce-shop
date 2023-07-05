import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  const configServ = app.get(ConfigService);
  const NODE_ENV = configServ.get<string>('NODE_ENV');
  const PORT = configServ.get<number>('PORT');
  console.log('🚀 ~ file: main.ts:9 ~ bootstrap ~ NODE_ENV:', NODE_ENV, PORT);
  await app.listen(PORT);
}
bootstrap();
