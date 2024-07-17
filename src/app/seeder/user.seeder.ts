import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { bcryptPassword } from 'src/utils/helper';

@Injectable()
export class UserSeeder {
    constructor(private readonly userService: UserService) { }

    async seed() {
        let admin = await this.userService.findMasterUserByEmail('admin@test.com');
        if (!admin) {
            await this.userService.createAdminUser(
                'admin',
                'admin@test.com',
                '1111111111',
                await bcryptPassword('Password@123'),
            );
            await this.userService.createTanantDbAndUser(
                'user',
                'user@test.com',
                '1111111111',
                await bcryptPassword('Password@123'),
            );
        }
    }
}
