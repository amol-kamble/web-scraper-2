import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static/dist/serve-static.module';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebScraperService } from './services/web-scraper';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'resources'),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, WebScraperService],
})
export class AppModule {}
