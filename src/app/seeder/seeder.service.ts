import { Injectable } from '@nestjs/common';
import { UserSeeder } from './user.seeder';

@Injectable()
export class SeederService {
    constructor(
        private readonly userSeeder: UserSeeder,
    ) { }

    async seed() {
        await this.userSeeder.seed();
    }
}
