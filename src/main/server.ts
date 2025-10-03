import { ExpressHttpServer } from "@infrastructure/adapters/api/express/createApp";

const httpServer = new ExpressHttpServer();

await httpServer.listen(3080);