import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { setTanantConnection } from 'src/utils/mongo-tanant-connection.util';
import { RoleSchema } from './roles.schema';

// @Injectable({ scope: Scope.REQUEST })
@Injectable()
export class RolePermissionService {
    public tanantRoleModel: Model<any>;

    // constructor(
    //     // @InjectModel(MasterUser.name) private masterUserModel: Model<MasterUser>,
    //     // @InjectModel(Tanant.name) private tanantModel: Model<Tanant>
    // ) { }

    async getTanantRoles(db_name) {
        this.tanantRoleModel = await setTanantConnection(db_name, 'Role', RoleSchema);
        const roles = await this.tanantRoleModel.find({ is_active: true }).exec();
        return roles.map((role)=> {
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

}
