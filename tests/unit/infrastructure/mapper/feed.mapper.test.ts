import { describe, it, expect } from 'vitest';
import { FeedMapper } from '../../../../src/infrastructure/adapters/persistence/mongo/mappers/feed.mapper';
import { FeedEntity } from '../../../../src/domain/entities/feed.entity';

const baseDto = () => ({
    title: 'Title',
    description: 'Description',
    author: 'Author',
    source: 'el_pais',
    mainTopic: 'international',
    url: 'https://example.com/news/1',
    premium: false,
    location: undefined,
    media: ['https://example.com/img.jpg'],
    subTopics: ['international'],
    relatedFeeds: ['https://example.com/rel1', 'https://example.com/rel2'],
    publishedAt: new Date('2024-01-01T00:00:00Z'),
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-02T00:00:00Z'),
});

describe('FeedMapper', () => {
    it('toPersistence maps value objects to primitives', () => {
        const entity = FeedEntity.create(baseDto() as any);
        const p = FeedMapper.toPersistence(entity);

        expect(p.source).toBe('el_pais');
        expect(p.mainTopic).toBe('international');
        expect(p.url).toBe('https://example.com/news/1');
        expect(Array.isArray(p.media)).toBe(true);
        expect(p.media[0]).toBe('https://example.com/img.jpg');
        expect(p.location).toBeNull();
    });

    it('toEntity maps primitives to entity with value objects', () => {
        const p = {
            ...baseDto(),
            location: null,
        };
        const e = FeedMapper.toEntity(p as any);
        const json = e.toJSON();
        expect(json.source.toPrimitive()).toBe('el_pais');
        expect(json.url.toPrimitive()).toBe('https://example.com/news/1');
        expect(json.location).toBeNull();
        expect(json.media[0].toPrimitive()).toBe('https://example.com/img.jpg');
    });
});