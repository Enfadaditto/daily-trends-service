import request from "supertest";
import { createApp } from "../src/infrastructure/api/express/createApp";
import { describe, it, expect } from "vitest";

describe('liveness', () => {
    it ('GET /liveness -> 200', async () => {
        const app = createApp();
        const response = await request(app).get('/liveness');
        expect(response.status).toBe(200);
    })
})