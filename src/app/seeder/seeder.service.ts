import { Injectable } from '@nestjs/common';
import { UserSeeder } from './user.seeder';
import { RolePermissionSeeder } from './role-permission.seeder';
import { UserAssignRoleSeeder } from './user-assign-role.seeder';

@Injectable()
export class SeederService {
    constructor(
        private readonly userSeeder: UserSeeder,
        private readonly rolePermissionSeeder: RolePermissionSeeder,
        private readonly userAssignRoleSeeder: UserAssignRoleSeeder,
    ) { }

    async seed() {
        await this.userSeeder.seed();
    }

    async tanantSeed(dbname) {
        await this.rolePermissionSeeder.tanantSeed(dbname);
        await this.userAssignRoleSeeder.seed(dbname);
    }
}
