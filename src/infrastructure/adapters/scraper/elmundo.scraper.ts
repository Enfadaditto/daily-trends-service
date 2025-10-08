import { FeedEntity } from "@src/domain/entities/feed.entity";
import type { ScraperPort } from "@src/domain/ports/scraper.port";
import * as cheerio from 'cheerio';

const SOURCE = 'https://www.elmundo.es';

export function normalizeUrl(href?: string): string {
    if (!href) return "";
    try {
      return new URL(href, SOURCE).toString();
    } catch (error) { return ""; }
}

export class ElMundoScraper implements ScraperPort {
    readonly source = 'el_mundo' as const;
    async scrape(limit = 5) {
        return await scrapeCheerio(limit);
    }
}

async function scrapeCheerio(limit = 5): Promise<FeedEntity[]> {
    const $ = await cheerio.fromURL(SOURCE);

    const selectors = [
        "article h2 a[href]",
        "h2 a[href]",
        "article header a[href]"
    ];
    const seen = new Set<string>();
    const out: FeedEntity[] = [];

    for (const sel of selectors) {
        $(sel).each((_i, el) => {
            if (out.length >= limit) return;
            const a = $(el);
            const title = a.text().trim().replace(/\s+/g, " ");
            const url = normalizeUrl(a.attr("href"));

            const article = a.closest("article");
            const description =
                article.find("p, .summary").first().text().trim() ||
                a.parent().siblings("p").first().text().trim() || "";

            const kicker = article
                .find(
                    ".ue-c-cover-content__kicker, .ue-c-article__kicker, .kicker, .kicker__title, .ue-c-cover-content__headline-kicker"
                )
                .first()
                .text()
                .trim();

            try {
                const u = new URL(url);
                let hasUltimaHora = false;
                u.searchParams.forEach((v) => {
                    if (hasUltimaHora) return;
                    const normalized = v
                        .replace(/\+/g, ' ')
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .toLowerCase()
                        .trim();
                    if (normalized === 'ultima hora') {
                        hasUltimaHora = true;
                    }
                });
                if (hasUltimaHora) return;
            } catch { }

            let section = "";
            let location = "";
            let date = new Date(0/0);
            try {
                const { pathname } = new URL(url);
                const segments = pathname.split('/').filter(Boolean);
                section = kicker || segments[0] || "";
                location = segments[0] ?? "";
                const [year, month, day] = [segments[1], segments[2], segments[3]];
                if (year && month && day && /^\d{4}$/.test(year) && /^\d{2}$/.test(month) && /^\d{2}$/.test(day)) {
                    date = new Date(`${year}-${month}-${day}`);
                }
            } catch { }

            const imgEl = article.find("img").first();
            const image =
                imgEl.attr("data-src") ||
                imgEl.attr("data-srcset")?.split(" ")[0] ||
                imgEl.attr("src");

            const authorText = article
                .find("a[rel='author'], .ue-c-article__byline-name, .byline .author, .signature .author, .ue-c-cover-content__byline-name")
                .first()
                .text()
                .trim();
            const sanitizedAuthor = authorText.replace(/^\s*redacci[oó]n:\s*/i, "").trim();

            if (!title || !url) return;
            if (seen.has(url)) return;
            seen.add(url);

            const scrapedFeed = FeedEntity.create({
                title: title,
                description: description,
                author: sanitizedAuthor,
                source: 'el_mundo',
                mainTopic: section,
                url: url,
                premium: false,
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