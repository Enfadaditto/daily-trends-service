import mongoose from "mongoose";

export type MongoConfig = {
    uri: string;
    dbName: string;
    user?: string;
    passwd?: string;
}

export class MongoConnection {
    private isConnected = false;
    
    constructor(private readonly config: MongoConfig) {}

    async connect(): Promise<mongoose.Connection> {
        if (this.isConnected) return mongoose.connection;
        
        await mongoose.connect(this.config.uri, {
            dbName: this.config.dbName,
            user: this.config.user ?? '',
            pass: this.config.passwd ?? '',
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000
        });
        
        this.isConnected = true;
        return mongoose.connection;
    }
    
    async disconnect() {
        if (!this.isConnected) return;
        await mongoose.connection.close();
        this.isConnected = false;
    }
}
