import { Inject, Injectable, Query, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository, Like, Equal } from 'typeorm';
import { PAGINATE } from 'src/config/constant.config';
// import { MasterUser } from './user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { MasterUser, MasterUserDocument } from './master-user.schema';
import mongoose, { Model, Types } from 'mongoose';
import { Tanant } from './tanant.schema';
import { snake_case } from 'src/utils/string.util';
import { MongoClient } from 'mongodb';
import * as migrateMongo from 'migrate-mongo';
import * as path from 'path';
const config = require('../../../migrate-mongo-config');
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class UserService {

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
        const uri = 'mongodb://localhost:27017?authSource=admin'; // Replace with your MongoDB connection string
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

    async createMasterUser(name: string, email: string, phone: string, password: string): Promise<MasterUser> {
        let tanant = await this.createTanant(name);
        await this.createDatabase(tanant.db_name);

        const newMasterUser = new this.userModel({
            tanant_id: tanant._id,
            name,
            email,
            phone,
            password
        });
        return await newMasterUser.save();
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
}
