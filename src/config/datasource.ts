import { databaseConfig } from "./database.config";
import { DataSource, DataSourceOptions } from "typeorm";

export const connectionSource = new DataSource(databaseConfig as DataSourceOptions);
