import * as cheerio from "cheerio";
import type { Source } from "@src/domain/entities/feed.entity";

// const SOURCE = 'EL PAIS';
const SOURCE = 'https://elpais.com';  // --> move to value object

function normalizeUrl(href?: string): string {
    if (!href) return "";
    try {
      return new URL(href, SOURCE).toString();
    } catch (error) { return ""; }
}

export async function scrapeElPais(limit = 5) {
    const $ = await cheerio.fromURL(SOURCE);
  
    const selectors = ["article h2 a[href]", "h2 a[href]", "article header a[href]"];
    const seen = new Set<string>();
    const out: Array<{ title: string; url: string; isPremium: boolean, summary: string; section: string; date: string; author: string; location: string; image: string }> = [];
  
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
        const summary =
          article.find("p, .c_d, .summary").first().text().trim() ||
          a.parent().siblings("p").first().text().trim() || "";

        const esc = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`${esc(SOURCE)}/([^/]+)/([^/]+)/`);
        const [, section = "", date = ""] = url.match(regex) || [];


        const authorAndLocation =
          article.find("a[rel='author'], .c_a, .byline .author").first().text().trim() ||
          a.parent().siblings("a").first().text().trim() || "";
        const [author = "", location = ""] = authorAndLocation.split("|");

        const imgEl =
          article.find("img").first();
        const image =
          imgEl.attr("data-src") || imgEl.attr("data-srcset")?.split(" ")[0] ||
          imgEl.attr("src") || "";

        if (!title || !url) return;
        if (seen.has(url)) return;

        if (url.includes("#") || /\.(jpg|jpeg|png|gif|webp)$/i.test(url)) return;
        seen.add(url);
        out.push({ title, url, isPremium, summary, section, date, author, location, image });
      });
      if (out.length >= limit) break;
    }
    return out;
  }
