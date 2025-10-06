import { UrlVO } from "@src/domain/value-objects/url.vo";
import type { FeedPersistence } from "../models/feed.schema";
import { FeedEntity } from "@src/domain/entities/feed.entity";

export class FeedMapper {
    static toPersistence(entity: FeedEntity): FeedPersistence {
        const document = entity.toJSON();
        const url = document.url.toPrimitive();
        const source = document.source.toPrimitive();
        const topic = document.mainTopic.toPrimitive();

        return {
            title: document.title,
            description: document.description,
            author: document.author,
            source: source,
            mainTopic: topic,
            url: url,
            premium: document.premium,
            location: document.location,

            media: (document.media as UrlVO[]).map(url => url.toPrimitive()),
            subTopics: document.subTopics.map(topic => topic.toPrimitive()),
            relatedFeeds: (document.relatedFeeds as UrlVO[]).map(url => url.toPrimitive()),
            
            publishedAt: document.publishedAt,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        }
    }

    static toEntity(persistence: FeedPersistence): FeedEntity {
        return FeedEntity.create({
            title: persistence.title,
            description: persistence.description,
            author: persistence.author,
            source: persistence.source,
            mainTopic: persistence.mainTopic,
            url: persistence.url,
            premium: persistence.premium,
            location: persistence.location ?? undefined,
            
            media: persistence.media,
            subTopics: persistence.subTopics,
            relatedFeeds: persistence.relatedFeeds,

            publishedAt: persistence.publishedAt,
            createdAt: persistence.createdAt,
            updatedAt: persistence.updatedAt,
        });
    }
}