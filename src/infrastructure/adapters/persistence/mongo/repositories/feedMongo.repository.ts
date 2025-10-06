import type { FeedEntity } from "@src/domain/entities/feed.entity";
import type { FeedQuery, FeedRepository } from "@src/domain/ports/feed.repository";
import { FeedMongoModel } from "../models/feed.schema";
import { FeedMapper } from "../mappers/feed.mapper";

export class FeedMongoRepository implements FeedRepository {
    async save(feed: FeedEntity): Promise<string> {
        const persistence = FeedMapper.toPersistence(feed);
        const updated = await FeedMongoModel.updateOne(
            { url: persistence.url },
            persistence,
            { upsert: true }
        );

        if (!(updated.modifiedCount + updated.upsertedCount)) {
            throw new Error("Failed to save feed");
        }

        return updated.upsertedId?.toString() ?? '';
    }

    async upsertMany(feeds: FeedEntity[]): Promise<{ number: number, ids: string[] }> {
        const persistence = [];
        for (const feed of feeds) persistence.push(FeedMapper.toPersistence(feed));

        const bulkOps = persistence.map(item => ({
            updateOne: {
                filter: { url: item.url },
                update: { $set: item },
                upsert: true
            }
        }));

        const result = await FeedMongoModel.bulkWrite(bulkOps);

        return {
            number: result.upsertedCount + result.modifiedCount,
            ids: [
                ...Object.values(result.upsertedIds).map(id => id.toString())
            ]
        };
    }

    async findById(id: string): Promise<FeedEntity | null> {
        const persistence = await FeedMongoModel.findById(id);
        return persistence ? FeedMapper.toEntity(persistence) : null;
    }

    async findByUrl(url: string): Promise<FeedEntity | null> {
        const persistence = await FeedMongoModel.findOne({ url });
        return persistence ? FeedMapper.toEntity(persistence) : null;
    }

    async find(filters: FeedQuery): Promise<FeedEntity[]> {
        const persistence = await FeedMongoModel.find(filters);
        return persistence.map(p => FeedMapper.toEntity(p));
    }
}