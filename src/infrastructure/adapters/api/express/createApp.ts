import express, { type Request, type Response } from "express";
import { type HttpServer, type HttpRequest, type HttpResponse, type HttpMethod } from "@src/http/ports/http.port";

export class ExpressHttpServer implements HttpServer {
    private app = express();
    constructor() { this.app.use(express.json()); }

    route(method: HttpMethod, path: string, handler: (req: HttpRequest) => Promise<HttpResponse> | HttpResponse) {
        const wrap = async (req: Request, res: Response) => {
            const request: HttpRequest = {
                params: req.params,
                query: req.query,
                headers: req.headers,
                body: req.body
            }

            try {
                const { status, body, headers } = await handler(request);
                if (headers) { 
                    for (const [key, value] of Object.entries(headers)) {
                        res.setHeader(key, value);
                    }
                }
                body === undefined ? res.sendStatus(status) : res.status(status).json(body);
            } catch (error: any) {
                res.status(500).json({ message: error?.message ?? 'Internal server error' });
            }
        };
        ({ GET: this.app.get, POST: this.app.post, PUT: this.app.put, DELETE: this.app.delete, PATCH: this.app.patch } as any)
            [method].call(this.app, path, wrap);
    }

    listen(port: number, host: string = '0.0.0.0') {
        return new Promise<void>(r => this.app.listen(port, host, () => {
            console.log(`Server is running on port ${port}`); 
            r();
        })); 
    }
}
