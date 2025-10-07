import { ListFeeds } from "@src/application/use-cases/listFeeds";
import type { FeedQuery, FeedRepository } from "@src/domain/ports/feed.repository";
import { type HttpController, type HttpServer, type HttpRequest } from "@src/http/ports/http.port";

export class ListFeedsController implements HttpController {
  constructor(
    private readonly feedRepository: FeedRepository
  ) {}

  register(server: HttpServer): void {
    // GET /list?filters=...
    server.route('GET', '/list', this.listFeeds.bind(this));
  }

  private async listFeeds(req: HttpRequest) {
    const filters = JSON.parse(req.query?.filters ?? '{}') as FeedQuery;
    try {
        const useCase = new ListFeeds(this.feedRepository);
        const data = await useCase.execute(filters);
        return { status: 200, body: data.map(feed => feed.toPrimitive()) };
    } catch (e: any) {
        return { status: 500, body: { message: e?.message ?? 'List feeds failed' } };
    }
  }
}
