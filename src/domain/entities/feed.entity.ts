import { z } from "zod";
import { SourceVO } from "@src/domain/value-objects/source.vo";
import { UrlVO } from "@src/domain/value-objects/url.vo";

const FeedEntitySchema = z.object({
    title: z.string(),
    description: z.string(),
    author: z.string(),
    source: z.string(),
    mainTopic: z.string(),
    subTopics: z.array(z.string()),
    url: z.string(),
    premium: z.boolean(),
    media: z.array(z.string()).optional(),
    relatedFeeds: z.array(z.string()).optional(),
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
    subTopics: string[];
    url: UrlVO;
    premium: boolean;
    media: UrlVO[];
    relatedFeeds: UrlVO[];
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
            subTopics: data.subTopics,
            url: UrlVO.create(data.url),
            premium: data.premium,
            media: data.media ? data.media.map(UrlVO.create) : [],
            relatedFeeds: data.relatedFeeds ? data.relatedFeeds.map(UrlVO.create) : [],
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