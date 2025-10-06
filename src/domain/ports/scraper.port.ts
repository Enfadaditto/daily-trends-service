import type { FeedEntity } from "@src/domain/entities/feed.entity";
import type { SourceType } from "@src/domain/value-objects/source.vo";

export interface ScraperPort {
    readonly source: SourceType;
    scrape(limit?: number): Promise<FeedEntity[]>;
}