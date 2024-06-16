import { TypeOrmModuleOptions } from '@nestjs/typeorm';
require('dotenv').config();

export const config = {
    type: (process.env.DB_TYPE) as 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    entities: [__dirname + '/../**/*.entity.js'],
    synchronize: false,
    logging: true,
};

export const databaseConfig: TypeOrmModuleOptions = {
    ...config,
    name: 'default',
    database: process.env.DB_NAME,
    migrations: ["dist/database/migrations/*{.ts,.js}"],
};