import type { FeedRepository } from "@src/domain/ports/feed.repository";

export class DetailedFeed {
    constructor(
        private readonly feedRepository: FeedRepository
    ) {}

    async execute(url: string) {
        return await this.feedRepository.findByUrl(url);
    }
}