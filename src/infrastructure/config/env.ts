export const env = {
    mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/daily-trends',
    mongoDbName: process.env.MONGO_DB_NAME ?? 'daily-trends',
}