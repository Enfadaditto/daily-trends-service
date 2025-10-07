import request from "supertest";
import { ExpressHttpServer } from "../src/infrastructure/adapters/api/express/createApp";
import { describe, it, expect } from "vitest";

describe('liveness', () => {
    it ('GET /liveness -> 200', async () => {
        const httpServer = new ExpressHttpServer();
        httpServer.route('GET', '/liveness', () => {
            return { status: 200 };
        });
        const response = await request((httpServer as any).app).get('/liveness');
        expect(response.status).toBe(200);
    })
})