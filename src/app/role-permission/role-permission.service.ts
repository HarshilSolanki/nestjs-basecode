import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { setTanantConnection } from 'src/utils/mongo-tanant-connection.util';
import { RoleSchema } from './roles.schema';
import { PermissionSchema } from './permissions.schema';
import { RolePermissionSchema } from './role_permissions.schema';

// @Injectable({ scope: Scope.REQUEST })
@Injectable()
export class RolePermissionService {
    public tanantRoleModel: Model<any>;
    public tanantPermissionModel: Model<any>;
    public rolePermissionModel: Model<any>;

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

    async tanantRoleCreate(roleName, db_name) {
        this.tanantRoleModel = await setTanantConnection(db_name, 'Role', RoleSchema);
        const role = new this.tanantRoleModel({
            name: roleName,
        });
        let result = await role.save();

        return {
            id: result._id,
            name: result.name,
            is_active: result.is_active,
        };
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
            id: result._id,
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

}
