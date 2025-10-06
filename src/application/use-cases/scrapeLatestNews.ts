import type { FeedRepository } from "@src/domain/ports/feed.repository";
import type { ScraperPort } from "@src/domain/ports/scraper.port";

export class ScrapeLatestNews {
    constructor(
        private readonly scraper: ScraperPort,
        private readonly feedRepository: FeedRepository
    ) {}

    async execute(limit = 5) {
        const feeds = await this.scraper.scrape(limit);
        const { number } = await this.feedRepository.upsertMany(feeds);
        return !!number;
    }
}