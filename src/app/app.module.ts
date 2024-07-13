import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from '../config/app.config';
import { i18nConfig } from 'src/config/i18n.config';
import { I18nModule } from 'nestjs-i18n';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingModule } from './setting/setting.module';
import { MongoDbConnection } from 'src/utils/mongo-db-connection.util';
import { RolePermissionModule } from './role-permission/role-permission.module';


@Module({
    imports: [
        ConfigModule.forRoot(appConfig),
        MongooseModule.forRoot(`${process.env.MONGO_URL}/${process.env.DB_NAME}`, {
            autoIndex: false,
            autoCreate: false,
            authSource: 'admin'
        }),
        I18nModule.forRoot(i18nConfig),
        SettingModule,
        AuthModule,
        RolePermissionModule,
    ],
    controllers: [AppController],
    providers: [AppService, MongoDbConnection],
})
export class AppModule { }
