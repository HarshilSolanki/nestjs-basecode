import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { SeederService } from './seeder.service';
import { UserSeeder } from './user.seeder';
import { RolePermissionModule } from '../role-permission/role-permission.module';
import { RolePermissionSeeder } from './role-permission.seeder';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from 'src/config/app.config';
import { UserAssignRoleSeeder } from './user-assign-role.seeder';

@Module({
    imports: [
        ConfigModule.forRoot(appConfig),
        MongooseModule.forRoot(`${process.env.MONGO_URL}/${process.env.DB_NAME}`, {
            autoIndex: false,
            autoCreate: false,
            authSource: 'admin'
        }),
        UserModule,
        RolePermissionModule,
    ],
    providers: [SeederService, UserSeeder, RolePermissionSeeder, UserAssignRoleSeeder],
})
export class SeederModule { }
