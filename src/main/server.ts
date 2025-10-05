import { ExpressHttpServer } from "@infrastructure/adapters/api/express/createApp";
import { ElPaisScraper } from "@src/infrastructure/adapters/scraper/elpais.scraper";
import { ScrapeController } from "@src/http/controllers/feedScrape.controller";

const httpServer = new ExpressHttpServer();

const scrapers = {
    'el_pais': new ElPaisScraper(),
    'el_mundo': (() => { throw new Error('Not implemented') }) as any,
}

new ScrapeController(scrapers).register(httpServer);

await httpServer.listen(3080);