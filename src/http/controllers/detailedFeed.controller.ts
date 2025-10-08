import { DetailedFeed } from "@src/application/use-cases/detailedFeed";
import type { FeedRepository } from "@src/domain/ports/feed.repository";
import { type HttpController, type HttpServer, type HttpRequest } from "@src/http/ports/http.port";

export class DetailedFeedController implements HttpController {
  constructor(
    private readonly feedRepository: FeedRepository
  ) {}

  register(server: HttpServer): void {
    // GET /detailed-feed?url=https://...
    server.route('GET', '/detailed-feed', this.detailedFeed.bind(this));
  }

  private async detailedFeed(req: HttpRequest) {
    const url = req.query?.url;
    if (!url) {
        return { status: 400, body: { message: 'URL is required' } };
    }

    try {
        const useCase = new DetailedFeed(this.feedRepository);
        const data = await useCase.execute(url);
        return { status: 200, body: data?.toPrimitive() };
    } catch (e: any) {
        return { status: 500, body: { message: e?.message ?? 'Detailed feed failed' } };
    }
  }
}
