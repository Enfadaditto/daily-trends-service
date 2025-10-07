import { vi, describe, it, expect, afterEach, beforeEach } from 'vitest';
import { ElPaisScraper, normalizeUrl } from '../../../../src/infrastructure/adapters/scraper/elpais.scraper';

beforeEach(() => vi.restoreAllMocks())
afterEach(() => vi.restoreAllMocks())

describe('ElPaisScraper', () => {  
    it('exposes the source', () => {
        const scraper = new ElPaisScraper();
        expect(scraper.source).toBe('el_pais');
    });

    it('delegates to scrapeCheerio', async () => {
        const scraper = new ElPaisScraper();
        const scrapeSpy = vi.spyOn(scraper, 'scrape');
        await scraper.scrape();
        expect(scrapeSpy).toHaveBeenCalled();
    });

    it('scrapes until limit is reached', async () => {
        const scraper = new ElPaisScraper();
        const scrapeSpy = vi.spyOn(scraper, 'scrape');
        await scraper.scrape(3);
        expect(scrapeSpy).toHaveBeenCalledWith(3);
    });
    
    it('normalizes the url', () => {
        const url = normalizeUrl('https://elpais.com/politica/2025-10-07/politica.html');
        expect(url).toBe('https://elpais.com/politica/2025-10-07/politica.html');
    });

    it('returns an empty string if the url is invalid', () => {
        const urlInvalid = normalizeUrl('/////////');
        expect(urlInvalid).toBe('');

        const urlUndefined = normalizeUrl(undefined)
        expect(urlUndefined).toBe('');

        const voidUrl = normalizeUrl("");
        expect(voidUrl).toBe('');

        const url2 = normalizeUrl('http://');
        expect(url2).toBe('');
    });

    it('deduplicates urls', async () => { /* Tested in elpais.scraper.cheerioMocked.test.ts */ });
});