import { FeedEntity } from "@src/domain/entities/feed.entity";
import type { SourceType } from "@src/domain/value-objects/source.vo";


export type FeedQuery = {
    title?: string;
    limit?: number;
    source?: SourceType;
    from?: Date;
    to?: Date;
    sort?: 'publishedAt:desc' | 'publishedAt:asc' | 'scrapedAt:desc' | 'title:asc' | 'title:desc';
};

export interface FeedRepository {
    save(feed: FeedEntity): Promise<string>;
    upsertMany(feeds: FeedEntity[]): Promise<{ number: number, ids: string[] }>;
    findById(id: string): Promise<FeedEntity | null>;
    findByUrl(url: string): Promise<FeedEntity | null>;
    find(filters: FeedQuery): Promise<FeedEntity[]>;
}
