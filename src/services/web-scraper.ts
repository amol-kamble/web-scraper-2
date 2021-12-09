import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, mkdirSync } from 'fs';
const SaveToExistingDirectoryPlugin = require('website-scraper-existing-directory');
import axios from 'axios';
import { fleschKincaid } from './redability.service';
const scrape = require('website-scraper');
var convertXmlToJson = require('xml-js');

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

    const contentRegex = new RegExp(/<\s*p[^>]*>(.*?)<\s*\/\s*p\s*>/gm);

    const content = result[0].text
      .match(contentRegex)
      .join('')
      .replaceAll(/<p>|<\/p>/gm, '<br>');

    const wordCount = this.countWords(content);

    const redabilityScore = fleschKincaid(content);

    return {
      folder,
      tree: this.deepCopy(result),
      content,
      wordCount,
      redabilityScore,
    };
  }

  public countWords = (str: string) => {
    str = str.trim();
    if (!str.length) {
      return str.length;
    }
    return str.trim().split(/\s+/).length;
  };

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
        current['children'] = this.deepCopy(node.children);
      }
      result.push(current);
    }
    return result;
  }

  public getSiteMap(elements, siteMap): any {
    for (const node of elements) {
      if (node.text && node.text.startsWith('http')) siteMap.push(node.text);
      if (node.elements && node.elements.length > 0) {
        this.getSiteMap(node.elements, siteMap);
      }
    }
    return siteMap;
  }

  public async getSiteMapByDomain(domain: string) {
    const response = await axios.get(`${domain}/sitemap.xml`);
    const siteMap = convertXmlToJson.xml2json(response.data);
    const elements = JSON.parse(siteMap).elements;
    return this.getSiteMap(elements, []);
  }
}
