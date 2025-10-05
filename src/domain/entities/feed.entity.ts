import { z } from "zod";
import { SourceVO } from "@src/domain/value-objects/source.vo";
import { UrlVO } from "@src/domain/value-objects/url.vo";

const FeedEntitySchema = z.object({
    title: z.string(),
    description: z.string(),
    author: z.string(),
    source: z.string(),
    mainTopic: z.string(),
    url: z.url(),
    premium: z.boolean(),
    location: z.string().optional(),

    media: z.array(z.url()),
    subTopics: z.array(z.string()),
    relatedFeeds: z.array(z.url()).optional(),
    publishedAt: z.date(),
    createdAt: z.date(),
    updatedAt: z.date(),
});
type FeedEntityDTO = z.infer<typeof FeedEntitySchema>;

type FeedProperties = {
    title: string;
    description: string;
    author: string;
    source: SourceVO;
    mainTopic: string;
    url: UrlVO;
    premium: boolean;
    location: string | null;

    media: UrlVO[];
    subTopics: string[];
    relatedFeeds: UrlVO[];
    publishedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export class FeedEntity {
    #properties: FeedProperties;

    private constructor(data: FeedProperties) {
        this.#properties = data; 
        Object.freeze(this);
    }

    static create(data: FeedEntityDTO) {
        if (data.updatedAt < data.createdAt) {
            throw new Error('Updated at must be greater than created at');
        }

        const properties: FeedProperties = {
            title: data.title,
            description: data.description,
            author: data.author,
            source: SourceVO.create(data.source),
            mainTopic: data.mainTopic,
            url: UrlVO.create(data.url),
            premium: data.premium,
            location: data.location ?? null,

            media: data.media.length ? data.media.map(UrlVO.create) : [],
            subTopics: data.subTopics,
            relatedFeeds: data.relatedFeeds ? data.relatedFeeds.map(UrlVO.create) : [],
            publishedAt: data.publishedAt,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        };
        
        return new FeedEntity(properties);
    }
    
    static fromJSON(json: string) {
        return FeedEntity.create(JSON.parse(json));
    }

    toJSON() {
        return { ...this.#properties };
    }
    
    get title() {
        return this.#properties.title;
    }

    get url() {
        return this.#properties.url;
    }

    get relatedFeeds() {
        return this.#properties.relatedFeeds.map(url => url.toPrimitive());
    }
}