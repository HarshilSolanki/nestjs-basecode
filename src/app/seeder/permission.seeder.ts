import { Injectable } from '@nestjs/common';
import { RolePermissionService } from '../role-permission/role-permission.service';

@Injectable()
export class PermissionSeeder {
    constructor(private readonly rolePermissionService: RolePermissionService) { }

    async tanantSeed(db_name) {
        const permissions = [
            'role.create',
            'role.edit',
            'role.view',
            'role.delete',
            'setting.create',
            'setting.edit',
            'setting.view',
            'setting.delete',
            'user.create',
            'user.edit',
            'user.view',
            'user.delete'
        ];

        for (const permissionName of permissions) {
            const permissionExist = await this.rolePermissionService.getTanantPermission(permissionName, db_name);
            if (!permissionExist) {
                const permission = await this.rolePermissionService.tanantPermissionCreate(permissionName, db_name);
                console.log(`Created permission: ${permission.name} with id: ${permission.id}`);
            }
        }
    }
}
