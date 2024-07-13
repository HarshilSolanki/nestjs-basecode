import { Injectable } from '@nestjs/common';
import { UserSeeder } from './user.seeder';
import { RoleSeeder } from './role.seeder';

@Injectable()
export class SeederService {
    constructor(
        private readonly userSeeder: UserSeeder,
        private readonly roleSeeder: RoleSeeder,
    ) { }

    async seed() {
        await this.userSeeder.seed();
    }

    async tanantSeed(dbname = '') {
        await this.roleSeeder.tanantSeed(dbname);
    }
}
