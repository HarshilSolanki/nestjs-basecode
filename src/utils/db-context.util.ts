import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { executePendingMigrations } from "./db-connection.util";
import { getDbNames } from "./helper";

@Injectable()
export class DbContext implements OnApplicationBootstrap {
    async runMigrations(databaseNames): Promise<void> {
        for (const dbName of databaseNames) {
            await executePendingMigrations(dbName, true);
        }
    }

    async onApplicationBootstrap(): Promise<void> {
        try {
            console.log(['MIGRATION PROCESS START']);
            await executePendingMigrations(process.env.DB_NAME);
            console.log(['GLOBAL TENANT TABLES MIGRATED']);

            const databaseNames = await getDbNames();
            await this.runMigrations(databaseNames);

            console.log("Migrations executed successfully in all databases");
            console.log(['TENANT TABLES MIGRATED']);
            console.log(['MIGRATION PROCESS END']);
        } catch (error) {
            console.error("Migration process failed:", error);
        }
    }
}
