import type { FeedQuery, FeedRepository } from "@src/domain/ports/feed.repository";

export class ListFeeds {
    constructor(
        private readonly feedRepository: FeedRepository
    ) {}

    async execute(filters: FeedQuery): Promise<Array<{ title: string; url: string; publishedAt: Date }>> {
        const feeds = await this.feedRepository.find(filters);
        return feeds.map(feed => {
            const primitive = feed.toPrimitive();
            return {
                title: primitive.title,
                url: primitive.url,
                publishedAt: primitive.publishedAt,
            };
        });
    }
}