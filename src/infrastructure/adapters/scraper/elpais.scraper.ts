import { FeedEntity } from "@src/domain/entities/feed.entity";
import type { ScraperPort } from "@src/domain/ports/scraper.port";
import * as cheerio from "cheerio";

const SOURCE = 'https://elpais.com';

function normalizeUrl(href?: string): string {
    if (!href) return "";
    try {
      return new URL(href, SOURCE).toString();
    } catch (error) { return ""; }
}

export class ElPaisScraper implements ScraperPort {
    readonly source = 'el_pais' as const;
    async scrape(limit = 5) {
        return await scrapeCheerio(limit);
    }
}

export async function scrapeCheerio(limit = 5): Promise<FeedEntity[]> {
    const $ = await cheerio.fromURL(SOURCE);
  
    const selectors = ["article h2 a[href]", "h2 a[href]", "article header a[href]"];
    const seen = new Set<string>();
    const out: FeedEntity[] = [];
  
    for (const sel of selectors) {
      $(sel).each((_i, el) => {
        if (out.length >= limit) return;
        const a = $(el);
        const title = a.text().trim().replace(/\s+/g, " ");
        const url = normalizeUrl(a.attr("href"));

        const SEL = 'span[name="elpais_ico"][class~="_pr"]';
        const isPremium =
          a.find(SEL).length > 0 ||
          a.closest("h1, h2, h3, .headline, header").find(SEL).length > 0;

        const article = a.closest("article");
        const description =
          article.find("p, .c_d, .summary").first().text().trim() ||
          a.parent().siblings("p").first().text().trim() || "";

        const esc = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`${esc(SOURCE)}/([^/]+)/([^/]+)/`);
        const [, section = "", dateStr = ""] = url.match(regex) || []; // from the scraping of the main page, the date comes as YYYY-MM-DD 
        const date = new Date(dateStr);

        const authorAndLocation =
          article.find("a[rel='author'], .c_a, .byline .author").first().text().trim() ||
          a.parent().siblings("a").first().text().trim() || "";
        const [author = "", location = ""] = authorAndLocation.split("|");

        const imgEl =
          article.find("img").first();
        const image =
          imgEl.attr("data-src") || imgEl.attr("data-srcset")?.split(" ")[0] ||
          imgEl.attr("src");

        if (!title || !url) return;
        if (seen.has(url)) return;

        // TODO: check if this is correct for the entity
        // if (url.includes("#") || /\.(jpg|jpeg|png|gif|webp)$/i.test(url)) return;
        seen.add(url);
        
        const scrapedFeed = FeedEntity.create({
          title: title,
          description: description,
          author: author,
          source: 'el_pais',
          mainTopic: section,
          url: url,
          premium: isPremium,
          location: location,

          media: image ? [image] : [],
          subTopics: [],
          relatedFeeds: [],
          publishedAt: date,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        out.push(scrapedFeed);
      });
      if (out.length >= limit) break;
    }
    return out;
  }
