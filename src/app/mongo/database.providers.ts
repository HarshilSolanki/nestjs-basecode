import { Connection } from 'mongoose';
import * as mongoose from 'mongoose';

export const databaseProviders = [
    {
        provide: 'DATABASE_CONNECTION',
        useFactory: async (): Promise<Connection> => {
            const connection: Connection = await mongoose.createConnection('mongodb://root:example@localhost:27017/nestjsmultitanant?authSource=admin');
            return connection;
        },
    },
];
