import express from "express";

export function createApp(): express.Application {
    const app = express();
    app.use(express.json());
    app.get("/liveness", (req: express.Request, res: express.Response) => {
        res.status(200).send("OK");
    });
    return app;
}
