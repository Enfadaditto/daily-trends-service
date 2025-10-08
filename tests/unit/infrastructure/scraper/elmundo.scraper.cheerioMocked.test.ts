import { it, expect, vi, beforeEach, afterEach, Mock } from 'vitest'

vi.mock('cheerio', async () => {
  const actual = await vi.importActual<typeof import('cheerio')>('cheerio')
  return {
    ...actual,
    fromURL: vi.fn(),
  }
})

import * as cheerio from 'cheerio'
import { ElMundoScraper } from '../../../../src/infrastructure/adapters/scraper/elmundo.scraper'

beforeEach(() => vi.clearAllMocks())
afterEach(() => vi.clearAllMocks())

// region URL & FILTERS
it('deduplicates urls', async () => {
  const html = `
    <article>
      <h2><a href="/internacional/2024/09/30/dup.html">Uno</a></h2>
      <p>Desc</p>
    </article>
    <h2><a href="/internacional/2024/09/30/dup.html">Repetido</a></h2>
  `;

  (cheerio.fromURL as unknown as Mock).mockResolvedValue(cheerio.load(html) as any);

  const scraper = new ElMundoScraper();
  const items = await scraper.scrape(5);

  expect(items).toHaveLength(1);
  const [json] = items.map(i => i.toJSON());
  expect(json.url.toPrimitive()).toBe('https://www.elmundo.es/internacional/2024/09/30/dup.html');
})

it('ignores items whose url contains catlivefeed or cat=livefeed', async () => {
  const html = `
    <article>
      <h2><a href="/espana/2025/10/07/l1.html?cat=livefeed">L1</a></h2>
      <p>Desc</p>
    </article>
    <article>
      <h2><a href="/espana/2025/10/07/l2.html?utm=one&CATLIVEFEED">L2</a></h2>
      <p>Desc</p>
    </article>
    <article>
      <h2><a href="/espana/2025/10/07/ok.html">OK</a></h2>
      <p>Desc</p>
    </article>
  `;

  (cheerio.fromURL as unknown as Mock).mockResolvedValue(cheerio.load(html) as any);

  const scraper = new ElMundoScraper();
  const items = await scraper.scrape(5);

  expect(items.map(i => i.toJSON().url.toPrimitive())).toEqual([
    'https://www.elmundo.es/espana/2025/10/07/ok.html',
  ]);
})
// endregion

// region SECTION, DATE, DESCRIPTION, IMAGE, AUTHOR
it('extracts section from kicker or first path segment and date y/m/d', async () => {
  const html = `
    <article>
      <div class="ue-c-article__kicker">politica</div>
      <h2><a href="/espana/2025/10/07/a1.html">A1</a></h2>
      <p>Desc 1</p>
    </article>
    <article>
      <h2><a href="/economia/2025/09/06/a2.html">A2</a></h2>
      <p>Desc 2</p>
    </article>
  `;

  (cheerio.fromURL as unknown as Mock).mockResolvedValue(cheerio.load(html) as any);

  const scraper = new ElMundoScraper();
  const items = await scraper.scrape(5);

  const [j1, j2] = items.map(i => i.toJSON());
  expect(j1.mainTopic.toPrimitive()).toBe('politica');
  expect(j1.publishedAt.toISOString().startsWith('2025-10-07')).toBe(true);
  expect(j2.mainTopic.toPrimitive()).toBe('economia');
  expect(j2.publishedAt.toISOString().startsWith('2025-09-06')).toBe(true);
})

it('takes description from article first p or sibling p as fallback', async () => {
  const html = `
    <article>
      <h2><a href="/internacional/2024/09/30/a1.html">A1</a></h2>
      <p>Primary</p>
      <p>Other</p>
    </article>

    <div>
      <h2><a href="/internacional/2024/09/30/a2.html">A2</a></h2>
      <p>Sibling should be used</p>
    </div>
  `;

  (cheerio.fromURL as unknown as Mock).mockResolvedValue(cheerio.load(html) as any);

  const scraper = new ElMundoScraper();
  const items = await scraper.scrape(5);

  const [j1, j2] = items.map(i => i.toJSON());
  expect(j1.description).toBe('Primary');
  expect(j2.description).toBe('Sibling should be used');
})

it('sets location to first path segment when kicker is missing', async () => {
  const html = `
    <article>
      <h2><a href="/economia/2025/09/06/a2.html">A2</a></h2>
      <p>Desc 2</p>
    </article>
  `;

  (cheerio.fromURL as unknown as Mock).mockResolvedValue(cheerio.load(html) as any);

  const scraper = new ElMundoScraper();
  const [item] = await scraper.scrape(1);
  const json = item.toJSON();
  expect(json.mainTopic.toPrimitive()).toBe('economia');
  expect(json.location).toBe('economia');
})

it('fallback url match sets empty section and location for root path', async () => {
  const html = `
    <article>
      <h2><a href="/">Uno</a></h2>
      <p>Desc</p>
    </article>
  `;

  (cheerio.fromURL as unknown as Mock).mockResolvedValue(cheerio.load(html) as any);

  const scraper = new ElMundoScraper();
  const [item] = await scraper.scrape(1);
  const json = item.toJSON();
  expect(json.mainTopic.toPrimitive()).toBe('');
  expect(json.location).toBe('');
})

it('selects image preferring data-src, then data-srcset first url, then src', async () => {
  const html = `
    <article>
      <h2><a href="/internacional/2024/09/30/i1.html">I1</a></h2>
      <img data-src="https://img/cdn/data-src.jpg" data-srcset="https://img/cdn/srcset-one.jpg 1x, https://img/cdn/srcset-two.jpg 2x" src="https://img/cdn/src.jpg"/>
      <p>Desc</p>
    </article>
    <article>
      <h2><a href="/internacional/2024/09/30/i2.html">I2</a></h2>
      <img data-srcset="https://img/cdn/srcset-one.jpg 1x, https://img/cdn/srcset-two.jpg 2x" src="https://img/cdn/src.jpg"/>
      <p>Desc</p>
    </article>
    <article>
      <h2><a href="/internacional/2024/09/30/i3.html">I3</a></h2>
      <img src="https://img/cdn/src.jpg"/>
      <p>Desc</p>
    </article>
    <article>
      <h2><a href="/internacional/2024/09/30/i4.html">I4</a></h2>
      <p>Desc</p>
    </article>
  `;

  (cheerio.fromURL as unknown as Mock).mockResolvedValue(cheerio.load(html) as any);

  const scraper = new ElMundoScraper();
  const items = await scraper.scrape(5);

  const media = items.map(i => i.toJSON().media.map((m: any) => (typeof m === 'string' ? m : m.toPrimitive())));
  expect(media[0]).toEqual(['https://img/cdn/data-src.jpg']);
  expect(media[1]).toEqual(['https://img/cdn/srcset-one.jpg']);
  expect(media[2]).toEqual(['https://img/cdn/src.jpg']);
  expect(media[3]).toEqual([]);
})

it('sanitizes author removing "redacción:" prefix and trims', async () => {
  const html = `
    <article>
      <h2><a href="/internacional/2024/09/30/a1.html">A1</a></h2>
      <div class="signature"><span class="author">  Redacción:  Equipo  </span></div>
      <p>Desc</p>
    </article>
  `;

  (cheerio.fromURL as unknown as Mock).mockResolvedValue(cheerio.load(html) as any);

  const scraper = new ElMundoScraper();
  const [item] = await scraper.scrape(1);
  expect(item.toJSON().author).toBe('Equipo');
})
// endregion

// region LIMITS
it('limits within the same selector and stops next selectors', async () => {
  const html = `
    <!-- First selector: article h2 a[href] -->
    <article><h2><a href="/politica/2024/10/01/p1.html">P1</a></h2><p>Desc 1</p></article>
    <article><h2><a href="/politica/2024/10/01/p2.html">P2</a></h2><p>Desc 2</p></article>
    <article><h2><a href="/politica/2024/10/01/p3.html">P3</a></h2><p>Desc 3</p></article>

    <!-- Second selector: h2 a[href] -->
    <h2><a href="/politica/2024/10/01/DO-NOT-PROCESS.html">Extra</a></h2>
  `;
  (cheerio.fromURL as unknown as Mock).mockResolvedValue(cheerio.load(html) as any);

  const scraper = new ElMundoScraper();
  const items = await scraper.scrape(2);

  expect(items).toHaveLength(2);
  const urls = items.map(i => i.toJSON().url.toPrimitive());
  expect(urls).toEqual([
    'https://www.elmundo.es/politica/2024/10/01/p1.html',
    'https://www.elmundo.es/politica/2024/10/01/p2.html',
  ]);
  expect(urls).not.toContain('https://www.elmundo.es/politica/2024/10/01/DO-NOT-PROCESS.html')
})
// endregion

// region INVALID URL
it('skips items with invalid url (early return) but keeps valid ones', async () => {
  const html = `
    <article><h2><a href="/////////">Bad</a></h2><p>Desc</p></article>
    <article><h2><a href="/internacional/2024/09/30/ok.html">OK</a></h2><p>Desc</p></article>
  `;
  (cheerio.fromURL as unknown as Mock).mockResolvedValue(cheerio.load(html) as any);

  const scraper = new ElMundoScraper();
  const items = await scraper.scrape(5);

  const urls = items.map(i => i.toJSON().url.toPrimitive());
  expect(urls).toEqual(['https://www.elmundo.es/internacional/2024/09/30/ok.html']);
});
// endregion


