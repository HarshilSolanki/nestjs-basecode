import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { SeederService } from './seeder.service';
import { UserSeeder } from './user.seeder';

@Module({
    imports: [
        MongooseModule.forRoot(`${process.env.MONGO_URL}/${process.env.DB_NAME}`, {
            autoIndex: false,
            autoCreate: false,
            authSource: 'admin'
        }),
        UserModule,
    ],
    providers: [SeederService, UserSeeder],
})
export class SeederModule { }
