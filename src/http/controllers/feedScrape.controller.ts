import { ScrapeLatestNews } from "@src/application/use-cases/scrapeLatestNews";
import type { FeedRepository } from "@src/domain/ports/feed.repository";
import type { ScraperPort } from "@src/domain/ports/scraper.port";
import { SourceSchema, type SourceType } from "@src/domain/value-objects/source.vo";
import { type HttpController, type HttpServer, type HttpRequest } from "@src/http/ports/http.port";
export class ScrapeController implements HttpController {

  constructor(
    private readonly scrapers: Record<SourceType, ScraperPort>,
    private readonly feedRepository: FeedRepository
  ) {}

  register(server: HttpServer): void {
    // GET /scrape?source=elpais
    server.route('GET', '/scrape', this.scrape.bind(this));
  }

  private async scrape(req: HttpRequest) {
    const sourceRaw = req.query?.source;
    const limit = Number(req.query?.limit ?? 5);

    const parsed = SourceSchema.safeParse(sourceRaw);
    if (!parsed.success) {
      return { status: 400, body: { message: "Invalid source. Use one of: el_pais, el_mundo" } };
    }

    const scraper = this.scrapers[parsed.data];
    if (!scraper) {
      return { status: 422, body: { message: `Source ${parsed.data} not supported yet` } };
    }

    try {
      const useCase = new ScrapeLatestNews(scraper, this.feedRepository);
      const data = await useCase.execute(Number.isFinite(limit) ? limit : 5);
      return { status: 200, body: data };
    } catch (e: any) {
      return { status: 500, body: { message: e?.message ?? 'Scrape failed' } };
    }
  }
}
