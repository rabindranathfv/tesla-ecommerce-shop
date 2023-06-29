import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configServ = app.get(ConfigService);
  const NODE_ENV = configServ.get<string>('NODE_ENV');
  const PORT = configServ.get<number>('PORT');
  console.log('🚀 ~ file: main.ts:9 ~ bootstrap ~ NODE_ENV:', NODE_ENV, PORT);
  await app.listen(PORT);
}
bootstrap();
