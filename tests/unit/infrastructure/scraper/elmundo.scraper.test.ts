import { vi, describe, it, expect, afterEach, beforeEach } from 'vitest';
import { ElMundoScraper, normalizeUrl } from '../../../../src/infrastructure/adapters/scraper/elmundo.scraper';

beforeEach(() => vi.restoreAllMocks())
afterEach(() => vi.restoreAllMocks())

describe('ElMundoScraper', () => {
    it('exposes the source', () => {
        const scraper = new ElMundoScraper();
        expect(scraper.source).toBe('el_mundo');
    });

    it('delegates to scrapeCheerio', async () => {
        const scraper = new ElMundoScraper();
        const scrapeSpy = vi.spyOn(scraper, 'scrape');
        await scraper.scrape();
        expect(scrapeSpy).toHaveBeenCalled();
    });

    it('scrapes until limit is reached', async () => {
        const scraper = new ElMundoScraper();
        const scrapeSpy = vi.spyOn(scraper, 'scrape');
        await scraper.scrape(3);
        expect(scrapeSpy).toHaveBeenCalledWith(3);
    });

    it('normalizes the url', () => {
        const abs = normalizeUrl('https://www.elmundo.es/espana/2025/10/07/politica.html');
        expect(abs).toBe('https://www.elmundo.es/espana/2025/10/07/politica.html');

        const rel = normalizeUrl('/espana/2025/10/07/politica.html');
        expect(rel).toBe('https://www.elmundo.es/espana/2025/10/07/politica.html');
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
});


