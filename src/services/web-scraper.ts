import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, mkdirSync } from 'fs';
const SaveToExistingDirectoryPlugin = require('website-scraper-existing-directory');
const JSON = require('serialize-json');
const _ = require('lodash');

const scrape = require('website-scraper');

const DEFAULT_RESOUCES_PATH = './resources';

@Injectable()
export class WebScraperService {
  constructor() {}

  public async scrape(url: string): Promise<Record<string, unknown>> {
    const folder = uuidv4();
    const dir = `${DEFAULT_RESOUCES_PATH}/${folder}`;
    if (!existsSync(dir)) {
      mkdirSync(dir);
    }
    const result = await scrape({
      urls: [url],
      directory: dir,
      plugins: [new SaveToExistingDirectoryPlugin()],
    });

    return { folder, tree: this.deepCopy(result) };
  }

  public getTypeFromExt(ext: string): string {
    if (
      ['png', 'jpeg', 'jpg', 'gif', 'svg', 'ico'].includes(
        (ext || '').toLowerCase(),
      )
    ) {
      return 'image';
    } else if (['ttf'].includes(ext)) {
      return 'font';
    } else {
      return ext;
    }
  }

  public deepCopy(nodes): any {
    const result = [];
    for (const node of nodes) {
      const current = {
        url: node.url,
        filename: node.filename,
        type: node.type
          ? node.type
          : this.getTypeFromExt(node?.filename?.split('.').pop()),
        depth: node.depth,
      };
      if (node.children && node.children.length > 0) {
        current['children'] = [];
        current['children'].push(this.deepCopy(node.children));
      }
      result.push(current);
    }
    return result;
  }
}
