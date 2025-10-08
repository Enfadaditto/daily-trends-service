import { describe, it, expect, vi } from 'vitest';
import { DetailedFeedController } from '../../../../src/http/controllers/detailedFeed.controller';

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

const makeEntity = (title = 'A', url = 'https://example.com/a') => ({
  toPrimitive: () => ({ title, url, publishedAt: new Date('2024-01-01T00:00:00Z') }),
});

describe('DetailedFeedController', () => {
  it('returns 400 when url is missing', async () => {
    const { server, routes } = makeServer();
    const repo = { findByUrl: vi.fn() } as any;
    const controller = new DetailedFeedController(repo);
    controller.register(server);

    const res = await routes['GET /detailed-feed'](makeReq());
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('URL is required');
  });

  it('returns 200 with primitive body when entity is found', async () => {
    const { server, routes } = makeServer();
    const entity = makeEntity('Title', 'https://example.com/news');
    const repo = { findByUrl: vi.fn().mockResolvedValue(entity) } as any;
    const controller = new DetailedFeedController(repo);
    controller.register(server);

    const res = await routes['GET /detailed-feed'](makeReq({ url: 'https://example.com/news' }));
    expect(repo.findByUrl).toHaveBeenCalledWith('https://example.com/news');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(entity.toPrimitive());
  });

  it('returns 200 with undefined body when entity not found', async () => {
    const { server, routes } = makeServer();
    const repo = { findByUrl: vi.fn().mockResolvedValue(null) } as any;
    const controller = new DetailedFeedController(repo);
    controller.register(server);

    const res = await routes['GET /detailed-feed'](makeReq({ url: 'https://example.com/not-found' }));
    expect(res.status).toBe(200);
    expect(res.body).toBeUndefined();
  });

  it('returns 500 when use case throws', async () => {
    const { server, routes } = makeServer();
    const repo = { findByUrl: vi.fn().mockRejectedValue(new Error('boom')) } as any;
    const controller = new DetailedFeedController(repo);
    controller.register(server);

    const res = await routes['GET /detailed-feed'](makeReq({ url: 'https://example.com/error' }));
    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/boom/);
  });

  it('returns 500 with default message when error has no message', async () => {
    const { server, routes } = makeServer();
    const repo = { findByUrl: vi.fn().mockRejectedValue({}) } as any;
    const controller = new DetailedFeedController(repo);
    controller.register(server);

    const res = await routes['GET /detailed-feed'](makeReq({ url: 'https://example.com/error' }));
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Detailed feed failed');
  });
});


