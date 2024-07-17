import { Injectable } from '@nestjs/common';
import { RolePermissionService } from '../role-permission/role-permission.service';

@Injectable()
export class RolePermissionSeeder {
    constructor(private readonly rolePermissionService: RolePermissionService) { }

    async tanantSeed(db_name: string) {
        const roles = ['super-admin', 'admin'];
        const allPermissions = [
            'role.create',
            'role.edit',
            'role.view',
            'role.delete',
            'role.assign',
            'setting.create',
            'setting.edit',
            'setting.view',
            'setting.delete',
            'user.create',
            'user.edit',
            'user.view',
            'user.delete',
        ];

        const adminPermissions = [
            'user.create',
            'user.edit',
            'user.view',
            'user.delete',
        ];

        for (const roleName of roles) {
            let role = await this.rolePermissionService.getTanantRole(roleName, db_name);
            if (!role) {
                role = await this.rolePermissionService.tanantRoleCreate(roleName, db_name);                
                console.log(`Created role: ${role.name} with id: ${role.id}`);

                const permissions = roleName === 'super-admin' ? allPermissions : adminPermissions;
                for (const permissionName of permissions) {
                    let permission = await this.rolePermissionService.getTanantPermission(permissionName, db_name);
                    if (!permission) {
                        permission = await this.rolePermissionService.tanantPermissionCreate(permissionName, db_name);
                        console.log(`Created permission: ${permission.name} with id: ${permission.id}`);
                    }
                    let rolePermission = await this.rolePermissionService.getAssignRolePermission(permission.id, role.id, db_name);
                    if (!rolePermission) {
                        await this.rolePermissionService.assignRolePermission(permission.id, role.id, db_name);
                        console.log(`Assigned permission: ${permission.name} to role: ${role.name}`);
                    }
                }
            }

        }
    }
}
