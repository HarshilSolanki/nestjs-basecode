import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { setTanantConnection } from 'src/utils/mongo-tanant-connection.util';
import { RoleSchema } from './roles.schema';
import { PermissionSchema } from './permissions.schema';
import { RolePermissionSchema } from './role_permissions.schema';
import { UserRoleSchema } from './user_role.schema';
import { UpdateRoleDTO } from './update-role.dto';

// @Injectable({ scope: Scope.REQUEST })
@Injectable()
export class RolePermissionService {
    public tanantRoleModel: Model<any>;
    public tanantPermissionModel: Model<any>;
    public rolePermissionModel: Model<any>;
    public userRoleModel: Model<any>;

    // constructor(
    //     // @InjectModel(MasterUser.name) private masterUserModel: Model<MasterUser>,
    //     // @InjectModel(Tanant.name) private tanantModel: Model<Tanant>
    // ) { }

    async getTanantRoles(db_name) {
        this.tanantRoleModel = await setTanantConnection(db_name, 'Role', RoleSchema);
        const roles = await this.tanantRoleModel.find({ is_active: true }).exec();
        return roles.map((role) => {
            return {
                'id': role._id,
                'name': role.name,
                'is_active': role.is_active,
            }
        });
    }

    async tanantRoleUpdate(db_name: string, updateRoleDTO: UpdateRoleDTO) {
        this.tanantRoleModel = await setTanantConnection(db_name, 'Role', RoleSchema);
        let role = await this.tanantRoleModel.findOne({ _id: updateRoleDTO.id }).exec();
        if (!role) {
            throw new NotFoundException('Role not found.');
        }
        return await this.tanantRoleModel.findByIdAndUpdate(updateRoleDTO.id, updateRoleDTO, { new: true }).exec();
    }

    async tanantRoleCreate(roleName, db_name) {
        this.tanantRoleModel = await setTanantConnection(db_name, 'Role', RoleSchema);
        const role = new this.tanantRoleModel({
            name: roleName,
        });
        let result = await role.save();
        return {
            id: result.id,
            name: result.name,
            is_active: result.is_active,
        };
    }

    async tanantRoleDelete(db_name, id: string) {
        this.tanantRoleModel = await setTanantConnection(db_name, 'Role', RoleSchema);
        let role = await this.tanantRoleModel.findOne({ _id: id }).exec();
        if (!role) {
            throw new NotFoundException('Role not found.');
        }
        return await this.tanantRoleModel.findByIdAndDelete(id).exec();
    }

    async getTanantRole(roleName, db_name) {
        this.tanantRoleModel = await setTanantConnection(db_name, 'Role', RoleSchema);
        return await this.tanantRoleModel.findOne({ name: roleName }).exec();
    }

    async getTanantPermissions(db_name) {
        this.tanantPermissionModel = await setTanantConnection(db_name, 'Permission', PermissionSchema);
        const permissions = await this.tanantPermissionModel.find({ is_active: true }).exec();
        return permissions.map((permission) => {
            return {
                'id': permission._id,
                'name': permission.name,
                'is_active': permission.is_active,
            }
        });
    }

    async tanantPermissionCreate(permissionName, db_name) {
        this.tanantPermissionModel = await setTanantConnection(db_name, 'Permission', PermissionSchema);
        const permission = new this.tanantPermissionModel({
            name: permissionName,
        });
        let result = await permission.save();

        return {
            id: result.id,
            name: result.name,
            is_active: result.is_active,
        };
    }

    async getTanantPermission(permissionName, db_name) {
        this.tanantPermissionModel = await setTanantConnection(db_name, 'Permission', PermissionSchema);
        return await this.tanantPermissionModel.findOne({ name: permissionName }).exec();
    }

    async assignRolePermission(permissionId, RoleId, db_name) {
        this.rolePermissionModel = await setTanantConnection(db_name, 'RolePermission', RolePermissionSchema);
        const rolePermission = new this.rolePermissionModel({
            role_id: RoleId,
            permission_id: permissionId,
        });
        let result = await rolePermission.save();

        return {
            id: result._id,
            role_id: result.role_id,
            permission_id: result.permission_id,
        };
    }

    async getAssignRolePermission(permissionId, RoleId, db_name) {
        this.rolePermissionModel = await setTanantConnection(db_name, 'RolePermission', RolePermissionSchema);
        return await this.rolePermissionModel.findOne({ role_id: RoleId, permission_id: permissionId }).exec();
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

    async getAssignUserRole(userId, RoleId, db_name) {
        this.userRoleModel = await setTanantConnection(db_name, 'UserRole', UserRoleSchema);
        return await this.userRoleModel.findOne({ user_id: userId, role_id: RoleId }).exec();
    }

}
