import type { FeedQuery, FeedRepository } from "@src/domain/ports/feed.repository";

export class ListFeeds {
    constructor(
        private readonly feedRepository: FeedRepository
    ) {}

    async execute(filters: FeedQuery) {
        return await this.feedRepository.find(filters);
    }
}