import { Injectable } from '@nestjs/common';
import { RolePermissionService } from '../role-permission/role-permission.service';

@Injectable()
export class RoleSeeder {
    constructor(private readonly rolePermissionService: RolePermissionService) { }

    async tanantSeed(db_name) {
        const roles = ['super-admin', 'admin'];
        
        for (const roleName of roles) {
            const role = await this.rolePermissionService.getTanantRole(roleName, db_name);
            if (!role) {
                const role = await this.rolePermissionService.tanantRoleCreate(roleName, db_name);
                console.log(`Created role: ${role.name} with id: ${role.id}`);
            }
        }
    }
}
