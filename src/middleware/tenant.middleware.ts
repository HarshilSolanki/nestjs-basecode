import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as mongoose from 'mongoose';

const exemptRoutes = [
    '/api/master/user/registration',
    '/api/master/login',
    '/api/user',
];

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    async use(req: Request, res: Response, next: NextFunction) {
        if (exemptRoutes.includes(req.baseUrl)) {
            next();
            return true;
        }
        const tenantId = req.headers['x-tenant-id'] as string;
        console.log(['tenantId', tenantId]);

        if (!tenantId) {
            throw new Error('Tenant ID is missing');
        }

        const connection = await mongoose.createConnection(`mongodb://root:example@localhost:27017/${tenantId}?authSource=admin`);

        (req as any).dbConnection = connection;
        next();
    }
}
