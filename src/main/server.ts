import { ExpressHttpServer } from "@infrastructure/adapters/api/express/createApp";
import { ScrapeController } from "@src/http/controllers/feedScrape.controller";

const httpServer = new ExpressHttpServer();
const scrapeController = new ScrapeController();

scrapeController.register(httpServer);

await httpServer.listen(3080);