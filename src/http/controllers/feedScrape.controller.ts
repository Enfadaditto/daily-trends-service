import { type HttpController, type HttpServer, type HttpRequest } from "@src/http/ports/http.port";
import { scrapeElPais } from "@src/infrastructure/adapters/scraper/elpais.scraper";

export class ScrapeController implements HttpController {
  register(server: HttpServer): void {
    server.route('GET', '/scrape/elpais', this.scrapeElPais.bind(this));
  }

  private async scrapeElPais(req: HttpRequest) {
    const limit = Number(req.query?.limit ?? 5);
    try {
      const data = await scrapeElPais(Number.isFinite(limit) ? limit : 5);
      return { status: 200, body: data };
    } catch (e: any) {
      return { status: 500, body: { message: e?.message ?? 'Scrape failed' } };
    }
  }
}
