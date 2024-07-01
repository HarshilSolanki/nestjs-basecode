import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { SeederService } from './seeder.service';
import { UserSeeder } from './user.seeder';

@Module({
    imports: [
        MongooseModule.forRoot('mongodb://root:example@localhost:27017/nestjsmultitanant?authSource=admin', {
            autoIndex: false,
            autoCreate: false,
        }),
        UserModule,
    ],
    providers: [SeederService, UserSeeder],
})
export class SeederModule { }
