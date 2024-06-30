import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { appConfig } from '../config/app.config';
import { databaseConfig } from '../config/database.config';
import { i18nConfig } from 'src/config/i18n.config';
import { I18nModule } from 'nestjs-i18n';
import { UserModule } from './user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IsUniqueConstraint } from 'src/decorators/is-unique.decorator';
import { AuthModule } from './auth/auth.module';
import { DbContext } from 'src/utils/db-context.util';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingModule } from './setting/setting.module';
import { connection } from 'mongoose';
import { MongoDbConnection } from 'src/utils/mongo-db-connection.util';
import { TenantMiddleware } from 'src/middleware/tenant.middleware';


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
        // UserModule
    ],
    controllers: [AppController],
    providers: [AppService, MongoDbConnection],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(TenantMiddleware).forRoutes('*');
    }
}
