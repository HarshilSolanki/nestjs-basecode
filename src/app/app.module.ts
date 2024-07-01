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


@Module({
    imports: [
        ConfigModule.forRoot(appConfig),
        MongooseModule.forRoot('mongodb://root:example@localhost:27017/nestjsmultitanant?authSource=admin', {
            autoIndex: false,
            autoCreate: false,
        }),
        I18nModule.forRoot(i18nConfig),
        SettingModule,
        AuthModule,
    ],
    controllers: [AppController],
    providers: [AppService, MongoDbConnection],
})
export class AppModule { }
