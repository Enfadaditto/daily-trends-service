import { describe, it, expect, vi } from 'vitest';
import { ListFeedsController } from '../../../../src/http/controllers/listFeeds.controller';

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

describe('ListFeedsController', () => {
  it('parses filters from query and returns 200 with body', async () => {
    const { server, routes } = makeServer();
    const repo = { find: vi.fn().mockResolvedValue([{ toPrimitive: () => ({ title: 'A', url: 'u', publishedAt: new Date('2024-01-01T00:00:00Z') }) }]) } as any;
    const controller = new ListFeedsController(repo);
    controller.register(server);

    const filters = { limit: 1, sort: 'publishedAt:desc' };
    const res = await routes['GET /list'](makeReq({ filters: JSON.stringify(filters) }));

    expect(repo.find).toHaveBeenCalledWith(filters);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('uses empty object when filters are missing and returns 200', async () => {
    const { server, routes } = makeServer();
    const repo = { find: vi.fn().mockResolvedValue([]) } as any;
    const controller = new ListFeedsController(repo);
    controller.register(server);

    const res = await routes['GET /list'](makeReq());
    expect(repo.find).toHaveBeenCalledWith({});
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns 500 when use case throws', async () => {
    const { server, routes } = makeServer();
    const repo = { find: vi.fn().mockRejectedValue(new Error('boom')) } as any;
    const controller = new ListFeedsController(repo);
    controller.register(server);

    const res = await routes['GET /list'](makeReq({ filters: JSON.stringify({}) }));
    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/boom/);
  });

  it('returns 500 with default message when error has no message', async () => {
    const { server, routes } = makeServer();
    const repo = { find: vi.fn().mockRejectedValue({}) } as any;
    const controller = new ListFeedsController(repo);
    controller.register(server);

    const res = await routes['GET /list'](makeReq({ filters: JSON.stringify({}) }));
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('List feeds failed');
  });
});


