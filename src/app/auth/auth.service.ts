import { HttpException, Injectable, Scope } from '@nestjs/common';
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
import { date_moment } from 'src/utils/date.util';
import { executeSeeder } from 'src/utils/mongo-db-connection.util';
import { UserRoleSchema } from '../role-permission/user_role.schema';
import { RoleSchema } from '../role-permission/roles.schema';
import { RolePermissionSchema } from '../role-permission/role_permissions.schema';
import { PermissionSchema } from '../role-permission/permissions.schema';
import { _404 } from 'src/utils/http-code.util';
const config = require('../../../migrate-mongo-config');

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
    public tanantUserModel: Model<any>;
    public userRoleModel: Model<any>;
    public roleModel: Model<any>;
    public rolePermissionModel: Model<any>;
    public tanantPermissionModel: Model<any>;

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

    async existTanant(name): Promise<Tanant> {
        const subdomain = await snake_case(name);
        return await this.tanantModel.findOne({ subdomain: subdomain, is_active: true }).exec();
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
            await executeSeeder(dbName);
            console.log(`${dbName} seeding successfully`);
        } catch (err) {
            console.error('Error creating database:', err);
        }
    }

    async masterUserRegistration(masterUserRegistertDTO: MasterUserRegistertDTO): Promise<any> {
        let tanant = await this.createTanant(masterUserRegistertDTO.name);
        await this.createDatabase(tanant.db_name);
        let data = await this.tanantUserRegistration(masterUserRegistertDTO, tanant.db_name);
        let role = await this.getTanantRole('super-admin', tanant.db_name);
        await this.assignUserRole(data.id, role.id, tanant.db_name);
        return {
            ...data,
            tanant_id: tanant._id,
            db_name: tanant.db_name,
            subdomain: tanant.subdomain,
        };
    }

    async signIn(loginDto: LoginDto): Promise<object | boolean> {
        const user = await this.masterUserModel.findOne({ email: loginDto.email, is_active: true }).exec();

        if (user && await bcryptComparePassword(loginDto.password, user.password)) {
            let data = {
                id: user._id,
                tanant_id: user.tanant_id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                is_active: user.is_active,
            }
            const token = await this.generateToken(data);
            return {
                ...data,
                token: token,
            };
        }
        return false;
    }

    async tanantUserRegistration(masterUserRegistertDTO: MasterUserRegistertDTO, db_name) {
        this.tanantUserModel = await setTanantConnection(db_name, 'User', TanantUserSchema);
        const user = new this.tanantUserModel({
            name: masterUserRegistertDTO.name,
            email: masterUserRegistertDTO.email,
            phone: masterUserRegistertDTO.phone,
            password: await bcryptPassword('Password@123'),
            is_active: true
        });
        let result = await user.save();
        return {
            name: result.name,
            email: result.email,
            phone: result.phone,
            is_active: result.is_active,
            id: result.id,
        };
    }

    async tanantUserLogin(loginDto: LoginDto, tanant): Promise<object | boolean> {
        let db_name = tanant.db_name;
        this.tanantUserModel = await setTanantConnection(db_name, 'User', TanantUserSchema);
        const user = await this.tanantUserModel.findOne({ email: loginDto.email, is_active: true }).exec();
        if (user && await bcryptComparePassword(loginDto.password, user.password)) {
            this.userRoleModel = await setTanantConnection(db_name, 'UserRole', UserRoleSchema);
            const userRole = await this.userRoleModel
                .findOne({ user_id: user.id })
                .exec();
            if (!userRole) {
                throw new HttpException({ success: false, message: 'Role not assign.' }, _404);
            }
            this.roleModel = await setTanantConnection(db_name, 'Role', RoleSchema);
            const role = await this.roleModel.findOne({ _id: userRole.role_id }).exec();
            let permissions = await this.getRolePermissions(role.id, db_name);
            let permissionIds = await permissions.map((permission) => {
                return permission.permission_id;
            })
            let rolePermission = await this.getUserRolePermissions(db_name, permissionIds);
            let rolePermissionArray = rolePermission.map((permission) => {
                return permission.name;
            });

            const data = {
                id: user.id,
                tanant_id: tanant ? tanant.id : user.tanant_id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                is_active: user.is_active,
                role_name: role.name,
                permissions: rolePermission,
            };
            const token = await this.generateToken(data, rolePermissionArray, tanant);

            return {
                ...data,
                token: token,
            }
        }
        return false;
    }

    async generateToken(payload, permissions = [], tanant = null): Promise<string> {
        return this.jwtService.signAsync({
            ...payload,
            db_name: tanant ? tanant.db_name : null,
            permissions: permissions
        });
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

    async getTanantBySubdomain(subdomain: string, isActive: boolean = false): Promise<Tanant | null> {
        const fields: any = { subdomain: subdomain, deleted_at: null };
        if (isActive) {
            fields['is_active'] = true;
        }
        return await this.tanantModel.findOne(fields).exec();
    }

    async deleteTanant(subdomain: string): Promise<Tanant | null> {
        return await this.tanantModel.findOneAndUpdate(
            { subdomain: subdomain, deleted_at: null },
            { deleted_at: date_moment() },
            { new: true }
        ).exec();
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

    async updateTanantStatus(subdomain: string, isActive: boolean): Promise<Tanant | null> {
        return this.tanantModel.findOneAndUpdate({ subdomain }, { is_active: isActive }, { new: true });
    }

    async getRolePermissions(RoleId, db_name) {
        this.rolePermissionModel = await setTanantConnection(db_name, 'RolePermission', RolePermissionSchema);
        return await this.rolePermissionModel.find({ role_id: RoleId }).exec();
    }

    async getUserRolePermissions(db_name, ids) {
        this.tanantPermissionModel = await setTanantConnection(db_name, 'Permission', PermissionSchema);
        const permissions = await this.tanantPermissionModel.find({ is_active: true, _id: ids }).exec();
        return permissions.map((permission) => {
            return {
                'id': permission._id,
                'name': permission.name,
                'is_active': permission.is_active,
            }
        });
    }

    async getTanantRole(roleName, db_name) {
        this.roleModel = await setTanantConnection(db_name, 'Role', RoleSchema);
        return await this.roleModel.findOne({ name: roleName }).exec();
    }

    async assignUserRole(userId, RoleId, db_name) {
        this.userRoleModel = await setTanantConnection(db_name, 'UserRole', UserRoleSchema);
        const rolePermission = new this.userRoleModel({
            user_id: userId,
            role_id: RoleId,
        });
        let result = await rolePermission.save();

        return {
            id: result._id,
            user_id: result.user_id,
            role_id: result.role_id,
        };
    }

}
