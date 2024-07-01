
import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

export function setTanantConnection(db_name, schemaType, TanantSchema) {
    const connection = mongoose.createConnection(`${process.env.MONGO_URL}/${db_name}?authSource=admin`);
    return connection.model(schemaType, TanantSchema);
}

export function createMongoConnection() {
    const url = `${process.env.MONGO_URL}?authSource=admin`;
    console.log(['url', url]);
    const client = new MongoClient(url);
    return client.connect();
}