import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express/interfaces/nest-express-application.interface';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  console.log(`${join(__dirname, '..', 'resources')}`);
  app.useStaticAssets(join(__dirname, '..', 'resources'));
  app.enableCors({
    origin : '*',
  })
  await app.listen(3000);
}
bootstrap();
