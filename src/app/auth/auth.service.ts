import { Injectable, Scope } from '@nestjs/common';
import { MasterUserRegistertDTO } from './dto/registration.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { bcryptComparePassword, bcryptPassword } from 'src/utils/helper';
import { snake_case } from 'src/utils/string.util';
import { InjectModel } from '@nestjs/mongoose';
import { MasterUser } from '../user/master-user.schema';
import { Tanant } from '../user/tanant.schema';
import { Model } from 'mongoose';
import * as migrateMongo from 'migrate-mongo';
import * as path from 'path';
import { TanantUserSchema } from '../user/tanant-user.schema';
import { createMongoConnection, setTanantConnection } from 'src/utils/mongo-tanant-connection.util';
const config = require('../../../migrate-mongo-config');

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
    public tanantUserModel: Model<any>;

    constructor(
        private readonly jwtService: JwtService,
        @InjectModel(MasterUser.name) private masterUserModel: Model<MasterUser>,
        @InjectModel(Tanant.name) private tanantModel: Model<Tanant>
    ) {
    }

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

    async masterUserRegistration(masterUserRegistertDTO: MasterUserRegistertDTO): Promise<any> {
        let tanant = await this.createTanant(masterUserRegistertDTO.name);
        await this.createDatabase(tanant.db_name);
        const newUser = new this.masterUserModel({
            tanant_id: tanant._id,
            name: masterUserRegistertDTO.name,
            email: masterUserRegistertDTO.email,
            phone: masterUserRegistertDTO.phone,
            password: await bcryptPassword(masterUserRegistertDTO.password)
        });
        let data = await newUser.save();

        return {
            tanant_id: data.tanant_id,
            db_name: tanant.db_name,
            subdomain: tanant.subdomain,
            name: data.name,
            email: data.email,
            phone: data.phone,
            id: data._id,
        };
    }

    async signIn(loginDto: LoginDto): Promise<object | boolean> {
        const user = await this.masterUserModel.findOne({ email: loginDto.email, is_active: true }).exec();

        if (user && await bcryptComparePassword(loginDto.password, user.password)) {
            const token = await this.generateToken(user);
            return {
                id: user._id,
                tanant_id: user.tanant_id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                is_active: user.is_active,
                token: token,
            };
        }
        return false;
    }

    async tanantUserRegistration(masterUserRegistertDTO: MasterUserRegistertDTO, db_name) {
        this.tanantUserModel = await setTanantConnection(db_name, 'User', TanantUserSchema);
        console.log(['checking']);
        const user = new this.tanantUserModel({
            name: masterUserRegistertDTO.name,
            email: masterUserRegistertDTO.email,
            phone: masterUserRegistertDTO.phone,
            password: await bcryptPassword(masterUserRegistertDTO.password),
            is_active: true
        });
        let result = await user.save();
        return {
            name: result.name,
            email: result.email,
            phone: result.phone,
            is_active: result.is_active,
            id: result._id,
        };
    }

    async tanantUserLogin(loginDto: LoginDto, db_name): Promise<object | boolean> {
        this.tanantUserModel = await setTanantConnection(db_name, 'User', TanantUserSchema);
        const user = await this.tanantUserModel.findOne({ email: loginDto.email, is_active: true }).exec();
        if (user && await bcryptComparePassword(loginDto.password, user.password)) {
            const token = await this.generateToken(user);
            return {
                id: user._id,
                tanant_id: user.tanant_id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                is_active: user.is_active,
                token: token,
            };
        }
        return false;
    }

    async generateToken(user): Promise<string> {
        const payload = {
            id: user.id,
            tanant_id: user.tanant_id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            is_active: user.is_active,
        };
        return this.jwtService.signAsync(payload);
    }

    async getUserByEmail(email: string): Promise<MasterUser | null> {
        return await this.masterUserModel.findOne({ email: email })
            .select(['id', 'tanant_id', 'name', 'email', 'phone', 'is_active'])
            .exec();
    }

    async getTanant(tanant: string): Promise<Tanant | null> {
        return await this.tanantModel.findOne({ db_name: tanant }).exec();
    }

    async getTanantById(id): Promise<Tanant | null> {
        return await this.tanantModel.findOne({ _id: id }).exec();
    }

    async deleteExistingDbs() {
        try {
            let dbs = [
                'tanant_amit_1719854419491',
                'tanant_jhon_doe_1719854296940',
                'tanant_user_1719854263622',
            ];
            const client = await createMongoConnection();
            for (const dbNamee of dbs) {
                const db = await client.db(dbNamee);
                const result = await db.dropDatabase();
                if (result) {
                    console.log(`Database ${dbNamee} deleted successfully`);
                } else {
                    console.log(`Failed to delete database ${dbNamee}`);
                }
            }
        } catch (err) {
            console.error('Error creating database:', err);
        }
    }

}
