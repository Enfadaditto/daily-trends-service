import { describe, it, expect, afterAll } from 'vitest';
import { MongoConnection } from '../../../../src/infrastructure/adapters/persistence/mongo/connect';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';


describe('MongoConnection', () => {
    let mongodb: MongoMemoryServer;
    
    it('connects, retries connect, disconnects and disconnects without connecting', async () => {
        mongodb = await MongoMemoryServer.create();
        const uri = mongodb.getUri();

        const mongoConnection = new MongoConnection({
            uri: uri,
            dbName: 'daily-trends',
        });

        // test connect
        const connection = await mongoConnection.connect();
        expect(connection.readyState).toBe(1);

        // test retry connect while connected
        const retryConnection = await mongoConnection.connect();
        expect(retryConnection.readyState).toBe(1);

        // test disconnect
        await mongoConnection.disconnect();
        expect(connection.readyState === 0 || connection.readyState === 3).toBe(true);

        // test disconnect without connecting
        await mongoConnection.disconnect();
        expect(connection.readyState === 0 || connection.readyState === 3).toBe(true);
    }, 20000);

    afterAll(async () => {
        if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
        if (mongodb) await mongodb.stop();
      });
});