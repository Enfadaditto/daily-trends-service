import { vi, describe, expect, it } from "vitest";
import { ScrapeLatestNews } from "../../../src/application/use-cases/scrapeLatestNews";

const mockFeed = () => ({ toJSON: () => ({}) } as any);

describe('ScrapeLatestNews', async () => {
    it('calls scraper and repository with feeds', async () => {
        const feeds = [mockFeed(), mockFeed()];
        const scraper = { scrape: vi.fn().mockResolvedValue(feeds) };
        const repository = { upsertMany: vi.fn().mockResolvedValue({ number: 1, ids: ['1','2'] }) };

        const useCase = new ScrapeLatestNews(scraper, repository);
        const result = await useCase.execute(3);

        expect(scraper.scrape).toHaveBeenCalledWith(3);
        expect(repository.upsertMany).toHaveBeenCalledWith(feeds);
        expect(result).toBe(true);
    });

    it('should return false if the scrape did not save any feed', async () => {
        const scraper = { scrape: vi.fn().mockResolvedValue([]) };
        const repository = { upsertMany: vi.fn().mockResolvedValue({ number: 0, ids: [] }) };

        const useCase = new ScrapeLatestNews(scraper, repository);
        const result = await useCase.execute(3);
        expect(result).toBe(false);
    });

    it('should return true if the scrape did save some feed', async () => {
        const scraper = { scrape: vi.fn().mockResolvedValue([mockFeed()]) };
        const repository = { upsertMany: vi.fn().mockResolvedValue({ number: 1, ids: ['1'] }) };

        const useCase = new ScrapeLatestNews(scraper, repository);
        const result = await useCase.execute();
        expect(result).toBe(true);
    });

    it('propagates scraper errors', async () => {
        const scraper = { scrape: vi.fn().mockRejectedValue(new Error('scrape failed')) };
        const repo = { upsertMany: vi.fn() };
    
        const uc = new ScrapeLatestNews(scraper as any, repo as any);
        await expect(uc.execute()).rejects.toThrow('scrape failed');
      });
    
    it('propagates repository errors', async () => {
    const scraper = { scrape: vi.fn().mockResolvedValue([mockFeed()]) };
    const repo = { upsertMany: vi.fn().mockRejectedValue(new Error('db failed')) };

    const uc = new ScrapeLatestNews(scraper as any, repo as any);
    await expect(uc.execute()).rejects.toThrow('db failed');
    });
})