// tanant-connection.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class TanantConnection {
    private tenantId: string;

    setTenant(tenantId: string) {
        this.tenantId = tenantId;
        console.log('Set Tenant ID:', tenantId); // Add logging
    }

    async getTenantConnection(): Promise<string> {
        const connectionString = `mongodb://root:example@localhost:27017/${this.tenantId}?authSource=admin`;
        console.log('Connection String:', connectionString); // Add logging
        return connectionString;
    }
}
