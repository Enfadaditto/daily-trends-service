import { describe, it, expect } from 'vitest';
import { FeedEntity } from '../../../../src/domain/entities/feed.entity';

const baseDto = () => ({
  title: 'Titulo',
  description: 'Desc',
  author: 'Autor',
  source: 'el_pais',
  mainTopic: 'politica',
  url: 'https://example.com/news/1',
  premium: false,
  location: undefined,
  media: ['https://example.com/img.jpg'],
  subTopics: ['internacional'],
  relatedFeeds: ['https://example.com/rel1', 'https://example.com/rel2'],
  publishedAt: new Date('2024-01-01T00:00:00Z'),
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-02T00:00:00Z'),
});

describe('FeedEntity', () => {
  it('creates a valid entity and exposes getters', () => {
    const entity = FeedEntity.create(baseDto() as any);

    expect(entity.title).toBe('Titulo');
    expect(entity.url.toPrimitive()).toBe('https://example.com/news/1');
    expect(Array.isArray(entity.relatedFeeds)).toBe(true);
    expect(entity.relatedFeeds).toEqual(['https://example.com/rel1', 'https://example.com/rel2']);

    const json = entity.toJSON();
    expect(json.location).toBeNull();
    expect(typeof (json.url as any).toPrimitive).toBe('function');
    expect((json.media as any[])[0].toPrimitive()).toBe('https://example.com/img.jpg');
  });

  it('compare returns true if url and source match', () => {
    const a = FeedEntity.create(baseDto() as any);
    const b = FeedEntity.create({ ...baseDto(), description: 'otra', premium: true } as any);
    expect(a.compare(b)).toBe(true);
  });

  it('compare returns false if the url changes', () => {
    const a = FeedEntity.create(baseDto() as any);
    const b = FeedEntity.create({ ...baseDto(), url: 'https://example.com/news/2' } as any);
    expect(a.compare(b)).toBe(false);
  });

  it('throws error if updatedAt < createdAt', () => {
    const bad = { ...baseDto(), updatedAt: new Date('2023-12-31T23:59:59Z') };
    expect(() => FeedEntity.create(bad as any)).toThrow('Updated at must be greater than created at');
  });

  it('accepts empty arrays and preserves them', () => {
    const dto = { ...baseDto(), media: [], subTopics: [], relatedFeeds: [] };
    const entity = FeedEntity.create(dto as any);
    const json = entity.toJSON();
    expect((json.media as any[]).length).toBe(0);
    expect(json.subTopics.length).toBe(0);
    expect(entity.relatedFeeds.length).toBe(0);
  });
});