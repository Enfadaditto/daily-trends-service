import { vi, describe, expect, it } from "vitest";
import { ListFeeds } from "../../../src/application/use-cases/listFeeds";

const makeFeed = (title: string, url: string, publishedAt: Date) => ({
    toPrimitive: () => ({
        title,
        url,
        publishedAt,
        // SHOULD be ignored by the use case
        description: 'desc',
        author: 'auth',
    }),
});

describe('ListFeeds', () => {
    it('calls repository with filters and maps to summary list', async () => {
        const filters: any = { limit: 2, sort: 'publishedAt:desc' };
        const feeds = [
            makeFeed('A', 'https://example.com/a', new Date('2024-01-01T00:00:00Z')),
            makeFeed('B', 'https://example.com/b', new Date('2024-01-02T00:00:00Z')),
        ];
        const repo = { find: vi.fn().mockResolvedValue(feeds) };

        const useCase = new ListFeeds(repo as any);
        const result = await useCase.execute(filters);

        expect(repo.find).toHaveBeenCalledWith(filters);
        expect(result).toEqual([
            { title: 'A', url: 'https://example.com/a', publishedAt: new Date('2024-01-01T00:00:00Z') },
            { title: 'B', url: 'https://example.com/b', publishedAt: new Date('2024-01-02T00:00:00Z') },
        ]);
    });

    it('returns empty array when repository returns no feeds', async () => {
        const repo = { find: vi.fn().mockResolvedValue([]) };
        const useCase = new ListFeeds(repo as any);
        const result = await useCase.execute({} as any);
        expect(result).toEqual([]);
    });

    it('propagates repository errors', async () => {
        const repo = { find: vi.fn().mockRejectedValue(new Error('db failed')) };
        const useCase = new ListFeeds(repo as any);
        await expect(useCase.execute({} as any)).rejects.toThrow('db failed');
    });
});


