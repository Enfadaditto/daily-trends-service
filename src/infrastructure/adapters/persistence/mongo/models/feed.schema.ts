import { SourceSchema, type SourceType } from "@src/domain/value-objects/source.vo";
import { Model, model, Schema } from "mongoose";

export type FeedPersistence = {
    _id?: string;
    title: string;
    description: string;
    author: string;
    source: SourceType;
    mainTopic: string;
    url: string;
    premium: boolean;
    location: string | null;

    media: string[];
    subTopics: string[];
    relatedFeeds: string[];

    publishedAt: Date;
    createdAt: Date;
    updatedAt: Date;
};

const FeedSchema = new Schema<FeedPersistence>({
    title: { type: String, required: true },
    description: { type: String, required: true, default: '' },
    author: { type: String, required: true, default: '' },
    source: { type: String, enum: Object.values(SourceSchema), required: true },
    mainTopic: { type: String, required: true },
    url: { type: String, required: true },
    premium: { type: Boolean, required: true },
    location: { type: String, required: true },
    media: { type: [String], required: true },
    subTopics: { type: [String], required: true },
    relatedFeeds: { type: [String], required: true },
    publishedAt: { type: Date, required: false },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
}, { versionKey: false, _id: false });

FeedSchema.index({ url: 1 }, { unique: true });
FeedSchema.index({ source: 1, publishedAt: 1 });

export const FeedMongoModel: Model<FeedPersistence> = model('Feed', FeedSchema);