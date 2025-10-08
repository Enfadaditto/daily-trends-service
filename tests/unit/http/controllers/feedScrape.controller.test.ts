import { describe, it, expect, vi } from 'vitest';
import { ScrapeController } from '../../../../src/http/controllers/feedScrape.controller';

function makeServer() {
  const routes: Record<string, (req: any) => Promise<any>> = {};
  const server = {
    route: vi.fn((method: string, path: string, handler: (req: any) => Promise<any>) => {
      routes[`${method} ${path}`] = handler;
    }),
  } as any;
  return { server, routes };
}

function makeReq(query: any = {}) {
  return { query } as any;
}

describe('ScrapeController', () => {
  it('returns 200 with boolean body on success', async () => {
    const { server, routes } = makeServer();
    const scraper = { scrape: vi.fn().mockResolvedValue([{ toJSON: () => ({}) }]) } as any;
    const feedRepository = { upsertMany: vi.fn().mockResolvedValue({ number: 1, ids: ['x'] }) } as any;
    const controller = new ScrapeController({ el_pais: scraper } as any, feedRepository);
    controller.register(server);

    const res = await routes['GET /scrape'](makeReq({ source: 'el_pais', limit: '3' }));
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('boolean');
    expect(res.body).toBe(true);
  });

  it('uses 5 by default when limit is not finite', async () => {
    const { server, routes } = makeServer();
    const scraper = { scrape: vi.fn().mockResolvedValue([{ toJSON: () => ({}) }]) } as any;
    const feedRepository = { upsertMany: vi.fn().mockResolvedValue({ number: 1, ids: ['x'] }) } as any;
    const controller = new ScrapeController({ el_pais: scraper } as any, feedRepository);
    controller.register(server);
  
    const res = await routes['GET /scrape'](makeReq({ source: 'el_pais', limit: 'NaN' }));
    expect(res.status).toBe(200); 
  });


  it('returns 400 on invalid source', async () => {
    const { server, routes } = makeServer();
    const controller = new ScrapeController({} as any, {} as any);
    controller.register(server);

    const res = await routes['GET /scrape'](makeReq({ source: 'invalid' }));
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Invalid source/);
  });

  it('returns 422 when source not supported', async () => {
    const { server, routes } = makeServer();
    const controller = new ScrapeController({} as any, {} as any);
    controller.register(server);

    const res = await routes['GET /scrape'](makeReq({ source: 'el_pais' }));
    expect(res.status).toBe(422);
    expect(res.body.message).toMatch(/not supported/);
  });

  it('returns 500 when use case throws', async () => {
    const { server, routes } = makeServer();
    const scraper = { scrape: vi.fn().mockRejectedValue(new Error('boom')) } as any;
    const feedRepository = { upsertMany: vi.fn() } as any;
    const controller = new ScrapeController({ el_pais: scraper } as any, feedRepository);
    controller.register(server);

    const res = await routes['GET /scrape'](makeReq({ source: 'el_pais' }));
    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/boom/);
  });
  
  it('returns 500 with default message when error does not have message', async () => {
    const { server, routes } = makeServer();
    const scraper = { scrape: vi.fn().mockRejectedValue({}) } as any;
    const feedRepository = { upsertMany: vi.fn() } as any;
    const controller = new ScrapeController({ el_pais: scraper } as any, feedRepository);
    controller.register(server);
  
    const res = await routes['GET /scrape'](makeReq({ source: 'el_pais' }));
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Scrape failed');
  });
});
