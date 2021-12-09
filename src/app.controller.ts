import { Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { WebScraperService } from './services/web-scraper';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly scraper: WebScraperService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/scrape')
  async scrape(@Query('url') url: string): Promise<Record<string, unknown>> {
    return this.scraper.scrape(url);
  }

  @Get('/sitemap')
  async sitemap(@Query('url') domain: string) {
    return this.scraper.getSiteMapByDomain(domain);
  }
}
