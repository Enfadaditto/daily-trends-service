import type { ScraperPort } from "@src/domain/ports/scraper.port";

export class ScrapeLatestNews {
    constructor(private readonly scraper: ScraperPort) {}

    async execute(limit = 5) {
        return await this.scraper.scrape(limit);
    }
}