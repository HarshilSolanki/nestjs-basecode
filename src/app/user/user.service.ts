import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MasterUser } from './master-user.schema';
import { Model, Types } from 'mongoose';
import { Tanant } from './tanant.schema';
import { snake_case } from 'src/utils/string.util';
import * as migrateMongo from 'migrate-mongo';
import * as path from 'path';
const config = require('../../../migrate-mongo-config');
import { createMongoConnection, setTanantConnection } from 'src/utils/mongo-tanant-connection.util';
import { TanantUserSchema } from './tanant-user.schema';
import { bcryptPassword } from 'src/utils/helper';
import { executeSeeder } from 'src/utils/mongo-db-connection.util';

@Injectable()
export class UserService {
    public tanantUserModel: Model<any>;

    constructor(
        @InjectModel(MasterUser.name) private userModel: Model<MasterUser>,
        @InjectModel(Tanant.name) private tanantModel: Model<Tanant>
    ) { }

    async createTanant(name): Promise<Tanant> {
        const subdomain = await snake_case(name);
        const db_name = 'tanant_' + subdomain + '_' + Date.now();

        const tanant = await new this.tanantModel({
            name: name,
            db_name: db_name,
            subdomain: subdomain,
        });

        return await tanant.save();
    }

    async createDatabase(dbName: string): Promise<void> {
        try {
            const client = await createMongoConnection();
            const db = client.db(dbName);
            migrateMongo.config.set({
                ...config,
                migrationsDir: path.join(__dirname, '../../', 'migrations', 'tanants'),
            });
            const { up } = migrateMongo;
            await up(db, client);
            console.log(`Database ${dbName} created successfully`);
        } catch (err) {
            console.error('Error creating database:', err);
        }
    }

    async createTanantDbAndUser(name: string, email: string, phone: string, password: string) {
        let tanant = await this.createTanant(name);
        await this.createDatabase(tanant.db_name);
        this.tanantUserModel = await setTanantConnection(tanant.db_name, 'User', TanantUserSchema);
        const user = new this.tanantUserModel({
            name: name,
            email: email,
            phone: phone,
            password: await bcryptPassword(password),
            is_active: true
        });
        let result = await user.save();
        await executeSeeder(tanant.db_name);
        return {
            name: result.name,
            email: result.email,
            phone: result.phone,
            is_active: result.is_active,
            id: result._id,
        };
    }

    async createAdminUser(name: string, email: string, phone: string, password: string): Promise<MasterUser> {
        const newMasterUser = new this.userModel({
            tanant_id: new Types.ObjectId(),
            name,
            email,
            phone,
            password
        });
        return await newMasterUser.save();
    }

    async findMasterUserByEmail(email: string): Promise<MasterUser> {
        return await this.userModel.findOne({ email: email }).exec();
    }

    async findTanantUserByEmail(db_name, email) {
        this.tanantUserModel = await setTanantConnection(db_name, 'User', TanantUserSchema);
        let result = await this.tanantUserModel.findOne({ email: email }).exec();

        if (result) {
            return {
                name: result.name,
                email: result.email,
                phone: result.phone,
                is_active: result.is_active,
                id: result.id,
            };
        }
        return null;
    }
}
