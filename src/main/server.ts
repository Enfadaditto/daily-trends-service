import { ExpressHttpServer } from "@infrastructure/adapters/api/express/createApp";
import { ElPaisScraper } from "@src/infrastructure/adapters/scraper/elpais.scraper";
import { ScrapeController } from "@src/http/controllers/feedScrape.controller";
import { MongoConnection } from "@src/infrastructure/adapters/persistence/mongo/connect";
import { FeedMongoRepository } from "@src/infrastructure/adapters/persistence/mongo/repositories/feedMongo.repository";
import { env } from "@src/infrastructure/config/env";
import { ListFeedsController } from "@src/http/controllers/listFeeds.controller";

async function main() {
    const mongoConnection = new MongoConnection({
        uri: env.mongoUri ?? '',
        dbName: env.mongoDbName ?? '',
    });
    await mongoConnection.connect();
    const feedRepository = new FeedMongoRepository();


    const httpServer = new ExpressHttpServer();

    const scrapers = {
        'el_pais': new ElPaisScraper(),
        'el_mundo': {
            source: 'el_mundo' as const,
            async scrape() {
                throw new Error("El mundo is not implemented");
            }
        }
    }

    new ScrapeController(scrapers, feedRepository).register(httpServer);
    new ListFeedsController(feedRepository).register(httpServer);

    await httpServer.listen(3080, '0.0.0.0');
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});