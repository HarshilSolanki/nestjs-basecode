import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { jwtConfig } from 'src/config/jwt.config';
import { MongooseModule } from '@nestjs/mongoose';
import { MasterUser, MasterUserSchema } from '../user/master-user.schema';
import { Tanant, TanantSchema } from '../user/tanant.schema';
import { TanantUser, TanantUserSchema } from '../user/tanant-user.schema';
import { PermissionsGuard } from './permission.guard';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: TanantUser.name, schema: TanantUserSchema },
            { name: MasterUser.name, schema: MasterUserSchema },
            { name: Tanant.name, schema: TanantSchema }
        ]),
        jwtConfig
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: PermissionsGuard,
        },
    ],
    exports: [AuthService],
})
export class AuthModule { }
