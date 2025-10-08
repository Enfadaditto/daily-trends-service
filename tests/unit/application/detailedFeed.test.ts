import { vi, describe, expect, it } from "vitest";
import { DetailedFeed } from "../../../src/application/use-cases/detailedFeed";

const mockFeed = () => ({ toJSON: () => ({}) } as any);

describe('DetailedFeed', () => {
    it('calls repository with url and returns the entity', async () => {
        const repo = { findByUrl: vi.fn().mockResolvedValue(mockFeed()) };

        const useCase = new DetailedFeed(repo as any);
        const url = 'https://example.com/news/1';
        const result = await useCase.execute(url);

        expect(repo.findByUrl).toHaveBeenCalledWith(url);
        expect(result).toBeTruthy();
    });

    it('returns null when repository returns null', async () => {
        const repo = { findByUrl: vi.fn().mockResolvedValue(null) };
        const useCase = new DetailedFeed(repo as any);
        const result = await useCase.execute('https://example.com/not-found');
        expect(result).toBeNull();
    });

    it('propagates repository errors', async () => {
        const repo = { findByUrl: vi.fn().mockRejectedValue(new Error('db failed')) };
        const useCase = new DetailedFeed(repo as any);
        await expect(useCase.execute('https://example.com/error')).rejects.toThrow('db failed');
    });
});


