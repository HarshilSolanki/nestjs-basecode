import { Inject, Injectable, Scope } from '@nestjs/common';
import { MasterUserRegistertDTO } from './dto/registration.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ResetPasswordDto } from './dto/forget-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { TOKEN_EXPIRATION_MINUTES } from 'src/config/constant.config';
import { SendEmailDto, sendEmail } from 'src/utils/mail.util';
// import { User } from 'src/app/user/user.entity';
import { plainToInstance } from 'class-transformer';
import { bcryptComparePassword, bcryptPassword, decrypt, encrypt, executeSql } from 'src/utils/helper';
import { add_minutes, date_moment, is_date_expire } from 'src/utils/date.util';
import { snake_case } from 'src/utils/string.util';
// import { Tanant } from '../user/tanant.entity';
import { executePendingMigrations } from 'src/utils/db-connection.util';
import { InjectModel } from '@nestjs/mongoose';
import { MasterUser } from '../user/master-user.schema';
import { Tanant } from '../user/tanant.schema';
import mongoose, { Model } from 'mongoose';
import { MongoClient } from 'mongodb';
import * as migrateMongo from 'migrate-mongo';
import * as path from 'path';
import { TanantUserSchema } from '../user/tanant-user.schema';
import { REQUEST } from '@nestjs/core';
const config = require('../../../migrate-mongo-config');

// @Injectable()
@Injectable({ scope: Scope.REQUEST })
export class AuthService {
    public tanantUserModel: Model<any>;

    constructor(
        @Inject(REQUEST) private readonly request: Request,
        private readonly jwtService: JwtService,
        @InjectModel(MasterUser.name) private masterUserModel: Model<MasterUser>,
        @InjectModel(Tanant.name) private tanantModel: Model<Tanant>
    ) {
        const connection = (this.request as any).dbConnection;
        if (connection) {
            try {
                this.tanantUserModel = connection.model('User', TanantUserSchema);
            } catch (error) {
                console.error('Error initializing tanantUserModel:', error);
            }
        } else {
            console.error('DB connection not found in request object');
        }
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
        const uri = 'mongodb://root:example@localhost:27017/nestmongotanant?authSource=admin'; // Replace with your MongoDB connection string
        const client = new MongoClient(uri);

        try {
            await client.connect();
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
        } finally {
            await client.close();
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

    async tanantUserRegistration(masterUserRegistertDTO: MasterUserRegistertDTO) {
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

    async tanantUserLogin(loginDto: LoginDto): Promise<object | boolean> {
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

    // async forgetPassword(email: string): Promise<boolean> {
    //     const user = await this.getUserByEmail(email);
    //     if (user) {
    //         const encryptedToken = encrypt(user.email);
    //         user.reset_token = encryptedToken;
    //         user.reset_token_date = date_moment();
    //         await this.userRepository.save(user);
    //         const emailDto: SendEmailDto = {
    //             to: [user.email],
    //             subject: 'Reset Your Password',
    //             template: 'forgot-password',
    //             data: {
    //                 name: user.name,
    //                 link: `${process.env.BASE_URL}/reset-password?token=${encryptedToken}`,
    //             },
    //         };
    //         await sendEmail(emailDto);
    //         return true;
    //     }
    //     return false;
    // }

    // async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<boolean> {
    //     const { token, new_password } = resetPasswordDto;

    //     const email = await decrypt(token);
    //     const user = await this.userRepository.findOne({ where: { email: email } });
    //     if (user && user.reset_token && user.reset_token_date) {
    //         const expirationTime = add_minutes(
    //             date_moment(user.reset_token_date),
    //             TOKEN_EXPIRATION_MINUTES
    //         );
    //         const currentTime = date_moment();
    //         if (is_date_expire(currentTime, expirationTime)) {
    //             return false;
    //         }

    //         user.password = await bcryptPassword(new_password);
    //         user.updated_at = date_moment();
    //         user.reset_token = null;
    //         user.reset_token_date = null;
    //         await this.userRepository.save(user);
    //         return true;
    //     }
    //     return false;
    // }

    // async changePassword(changePasswordDto: ChangePasswordDto, id): Promise<boolean> {
    //     const user = await this.userRepository.findOne({ where: { id: id } });
    //     if (await bcryptComparePassword(changePasswordDto.old_password, user.password)) {
    //         const newHashedPassword = await bcryptPassword(changePasswordDto.new_password);
    //         user.password = newHashedPassword;
    //         await this.userRepository.save(user);
    //         return true;
    //     }
    //     return false;
    // }

    // async createDatabase(dbName: string): Promise<any> {
    //     return await executeSql(`CREATE DATABASE ${dbName}`);
    // }

    async deleteExistingDbs() {
        const uri = 'mongodb://root:example@localhost:27017?authSource=admin';
        const client = new MongoClient(uri);
        try {
            let dbs = [
                'nestjsmultitanant',
                'nestmongo',
                'tanant_jhon_doe_1719745101779',
                'tanant_nathan_will_1719667291109',
                'tanant_pat_klein_1719667290922',
                'tanant_rolando_crona_1719676217252',
            ];
            await client.connect();
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
        } finally {
            await client.close();
        }
    }

}
