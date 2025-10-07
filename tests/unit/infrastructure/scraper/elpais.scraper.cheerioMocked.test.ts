import { it, expect, vi, beforeEach, afterEach, Mock } from 'vitest'

vi.mock('cheerio', async () => {
  const actual = await vi.importActual<typeof import('cheerio')>('cheerio')
  return {
    ...actual,
    fromURL: vi.fn(),
  }
})

import * as cheerio from 'cheerio'
import { ElPaisScraper } from '../../../../src/infrastructure/adapters/scraper/elpais.scraper'

beforeEach(() => vi.clearAllMocks())
afterEach(() => vi.clearAllMocks())

//region URL
it('deduplicates urls', async () => {
  const html = `
    <article>
      <h2><a href="/internacional/2024-09-30/dup.html">Uno</a></h2>
      <p>Desc</p>
    </article>
    <h2><a href="/internacional/2024-09-30/dup.html">Repetido</a></h2>
  `;

  (cheerio.fromURL as unknown as Mock).mockResolvedValue(cheerio.load(html) as any);

  const scraper = new ElPaisScraper();
  const items = await scraper.scrape(5);

  expect(items).toHaveLength(1);
  const [json] = items.map(i => i.toJSON());
  expect(json.url.toPrimitive()).toBe('https://elpais.com/internacional/2024-09-30/dup.html');
})

it('fallback url match', async () => {
  const html = `
    <article>
      <h2><a href="/">Uno</a></h2>
      <p>Desc</p>
    </article>
  `;

  (cheerio.fromURL as unknown as Mock).mockResolvedValue(cheerio.load(html) as any);

  const scraper = new ElPaisScraper();
  const [items] = await scraper.scrape(1);
  expect(items.toJSON().mainTopic.toPrimitive()).toBe('');
  expect(items.toJSON().date).toBe(undefined);
})
//endregion

//region LIMITS
it('limits within the same selector', async () => {
  const html = `
    <article><h2><a href="/internacional/2024-09-30/a1.html">A1</a></h2><p>Desc 1</p></article>
    <article><h2><a href="/internacional/2024-09-30/a2.html">A2</a></h2><p>Desc 2</p></article>
    <article><h2><a href="/internacional/2024-09-30/a3.html">A3</a></h2><p>Desc 3</p></article>
  `;
  (cheerio.fromURL as unknown as Mock).mockResolvedValue(cheerio.load(html) as any);

  const scraper = new ElPaisScraper();
  const items = await scraper.scrape(2);

  expect(items).toHaveLength(2);
  const urls = items.map(i => i.toJSON().url.toPrimitive());
  expect(urls).toEqual([
    'https://elpais.com/internacional/2024-09-30/a1.html',
    'https://elpais.com/internacional/2024-09-30/a2.html',
  ]);
})

it('does not process the following selectors when the limit is reached', async () => {
    const html = `
      <!-- First selector: article h2 a[href] -->
      <article><h2><a href="/politica/2024-10-01/p1.html">P1</a></h2><p>Desc 1</p></article>
      <article><h2><a href="/politica/2024-10-01/p2.html">P2</a></h2><p>Desc 2</p></article>
  
      <!-- Second selector: h2 a[href] -->
      <h2><a href="/politica/2024-10-01/DO-NOT-PROCESS.html">Extra</a></h2>
    `;
    (cheerio.fromURL as unknown as Mock).mockResolvedValue(cheerio.load(html) as any);
  
    const scraper = new ElPaisScraper();
    const items = await scraper.scrape(2);
  
    expect(items).toHaveLength(2);
    const urls = items.map(i => i.toJSON().url.toPrimitive());
    expect(urls).toEqual([
      'https://elpais.com/politica/2024-10-01/p1.html',
      'https://elpais.com/politica/2024-10-01/p2.html',
    ]);
    expect(urls).not.toContain('https://elpais.com/politica/2024-10-01/DO-NOT-PROCESS.html')
})
//endregion

//region DESCRIPTION
it('uses the description from the <article>', async () => {
  const html = `
    <article>
      <h2><a href="/internacional/2024-09-30/a1.html">A1</a></h2>
      <p>Description from the article</p>
      <p>Other paragraph</p>
    </article>
    
    <p>Sibling paragraph (should not be used)</p>
  `;
  (cheerio.fromURL as unknown as Mock).mockResolvedValue(cheerio.load(html) as any);

  const scraper = new ElPaisScraper();
  const [feed] = await scraper.scrape(1);
  expect(feed.toJSON().description).toBe('Description from the article');
})

it('if there is no description, retrieves an empty string', async () => {
  const html = `
    <article>
      <h2><a href="/internacional/2024-09-30/a3.html">A3</a></h2>
    </article>
  `;  
  (cheerio.fromURL as unknown as Mock).mockResolvedValue(cheerio.load(html) as any);

  const scraper = new ElPaisScraper();
  const [feed] = await scraper.scrape(1);
  expect(feed.toJSON().description).toBe('');
})
//endregion

//region PREMIUM
it('marks premium if the span is inside the <a>', async () => {
  const html = `
    <article>
      <h2>
        <a href="/internacional/2024-09-30/p1.html">
          News
          <span name="elpais_ico" class="ico _pr"></span>
        </a>
      </h2>
      <p>Desc</p>
    </article>
  `;
  (cheerio.fromURL as unknown as Mock).mockResolvedValue(cheerio.load(html) as any);

  const scraper = new ElPaisScraper();
  const [item] = await scraper.scrape(1);
  expect(item.toJSON().premium).toBe(true);
})

it('marks premium if the span is in ancestors (h2/header/headline)', async () => {
  const html = `
    <article>
      <h2>
        <span name="elpais_ico" class="ico _pr"></span>
        <a href="/internacional/2024-09-30/p2.html">News</a>
      </h2>
      <p>Desc</p>
    </article>
  `;
  (cheerio.fromURL as unknown as Mock).mockResolvedValue(cheerio.load(html) as any);

  const scraper = new ElPaisScraper();
  const [item] = await scraper.scrape(1);
  expect(item.toJSON().premium).toBe(true);
})

it('does not mark premium if the span does not have a class with "_pr"', async () => {
  const html = `
    <article>
      <h2>
        <a href="/internacional/2024-09-30/p3.html">
          News
          <span name="elpais_ico" class="ico"></span>
        </a>
      </h2>
      <p>Desc</p>
    </article>
  `;
  (cheerio.fromURL as unknown as Mock).mockResolvedValue(cheerio.load(html) as any);

  const scraper = new ElPaisScraper();  
  const [item] = await scraper.scrape(1);
  expect(item.toJSON().premium).toBe(false);
})

it('does not mark premium if the span has another name or does not exist', async () => {
  const html = `
    <article>
      <h2>
        <a href="/internacional/2024-09-30/p4.html">News</a>
        <span name="otro_ico" class="_pr"></span>
      </h2>
      <p>Desc</p>
    </article>
  `;
  (cheerio.fromURL as unknown as Mock).mockResolvedValue(cheerio.load(html) as any);

  const scraper = new ElPaisScraper();
  const [item] = await scraper.scrape(1);
  expect(item.toJSON().premium).toBe(false);
})
//endregion

//region IMAGE
it('uses data-src over data-srcset and src', async () => {
  const html = `
    <article>
      <h2><a href="/internacional/2024-09-30/i1.html">I1</a></h2>
      <img
        data-src="https://img/cdn/data-src.jpg"
        data-srcset="https://img/cdn/srcset-one.jpg 1x, https://img/cdn/srcset-two.jpg 2x"
        src="https://img/cdn/src.jpg"
      />
      <p>Desc</p>
    </article>
  `;
  (cheerio.fromURL as unknown as Mock).mockResolvedValue(cheerio.load(html) as any);

  const scraper = new ElPaisScraper();
  const [item] = await scraper.scrape(1);
  const media = item.toJSON().media.map((m: any) => (typeof m === 'string' ? m : m.toPrimitive()));
  expect(media).toEqual(['https://img/cdn/data-src.jpg']);
})

it('if there is no data-src, uses the first URL of data-srcset', async () => {
  const html = `
    <article>
      <h2><a href="/internacional/2024-09-30/i2.html">I2</a></h2>
      <img
        data-srcset="https://img/cdn/srcset-one.jpg 1x, https://img/cdn/srcset-two.jpg 2x"
        src="https://img/cdn/src.jpg"
      />
      <p>Desc</p>
    </article>
  `;
  (cheerio.fromURL as unknown as Mock).mockResolvedValue(cheerio.load(html) as any);

  const scraper = new ElPaisScraper();
  const [item] = await scraper.scrape(1);
  const media = item.toJSON().media.map((m: any) => (typeof m === 'string' ? m : m.toPrimitive()));
  expect(media).toEqual(['https://img/cdn/srcset-one.jpg']);
})

it('if there is no data-src nor data-srcset, uses src', async () => {
  const html = `
    <article>
      <h2><a href="/internacional/2024-09-30/i3.html">I3</a></h2>
      <img src="https://img/cdn/src.jpg" />
      <p>Desc</p>
    </article>
  `;
  (cheerio.fromURL as unknown as Mock).mockResolvedValue(cheerio.load(html) as any);

  const scraper = new ElPaisScraper();
  const [item] = await scraper.scrape(1);
  const media = item.toJSON().media.map((m: any) => (typeof m === 'string' ? m : m.toPrimitive()));
  expect(media).toEqual(['https://img/cdn/src.jpg']);
})

it('if there is no image, media=[]', async () => {
  const html = `
    <article>
      <h2><a href="/internacional/2024-09-30/i4.html">I4</a></h2>
      <p>Desc</p>
    </article>
  `;
  (cheerio.fromURL as unknown as Mock).mockResolvedValue(cheerio.load(html) as any);

  const scraper = new ElPaisScraper();
  const [item] = await scraper.scrape(1);
  const media = item.toJSON().media.map((m: any) => (typeof m === 'string' ? m : m.toPrimitive()));
  expect(media).toEqual([]);
})
//endregion

it('skips items with invalid url (early return)', async () => {
  const html = `
    <article><h2><a href="/////////">Bad</a></h2><p>Desc</p></article>
    <article><h2><a href="/internacional/2024-09-30/ok.html">OK</a></h2><p>Desc</p></article>
  `;
  (cheerio.fromURL as unknown as Mock).mockResolvedValue(cheerio.load(html) as any);

  const scraper = new ElPaisScraper();
  const items = await scraper.scrape(5);

  const urls = items.map(i => i.toJSON().url.toPrimitive());
  expect(urls).toEqual(['https://elpais.com/internacional/2024-09-30/ok.html']);
});
