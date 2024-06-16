import { Connection } from 'typeorm';
import { MigrationExecutor, createConnection, getConnectionManager } from 'typeorm';
import { config } from '../config/database.config';

export async function executePendingMigrations(db_name, isTanant = false) {
    const connection: Connection = await connectionEstablish(db_name, isTanant);

    // Run migrations
    const migrationExecutor = new MigrationExecutor(connection);
    await migrationExecutor.executePendingMigrations();
    await connection.close();
}

export async function connectionEstablish(db_name: string, isTanant = false): Promise<Connection> {
    const connectionManager = getConnectionManager();
    console.log(['connection', db_name, connectionManager.has(db_name)]);
    if (connectionManager.has(db_name)) {
        const existingConnection = await connectionManager.get(db_name);

        // Return the existing connection if it's connected
        if (existingConnection.isConnected) {
            console.log(`Connection '${db_name}' already exists and is connected.`);
            return existingConnection;
        }
        console.log(`Connection '${db_name}' exists but is not connected. Re-establishing connection...`);
    }

    // Create a new connection
    const connection: Connection = await createConnection({
        ...config,
        name: db_name,
        database: db_name,
        migrations: isTanant ? ["dist/database/migrations/tanants/*{.ts,.js}"] : ["dist/database/migrations/*{.ts,.js}"],
    });

    console.log(`Connection '${db_name}' established.`);
    return connection;
}