import { Injectable, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository, Like, Equal } from 'typeorm';
import { PAGINATE } from 'src/config/constant.config';
import { User } from './user.entity';

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private usersRepository: Repository<User>) { }

    async getUserByEmail(email: string): Promise<User | undefined> {
        return await this.usersRepository.findOne({ where: { email } });
    }

    async getUserById(id: number): Promise<User | undefined> {
        return await this.usersRepository.findOne({ where: { id } });
    }

    async getUsers(@Query() queryParams: any): Promise<{ data: User[]; totalCount: number }> {
        let { page = PAGINATE.PAGE, limit = PAGINATE.LIMIT, search = '', sort_by = 'id', sort_order = 'desc' } = queryParams;

        const options: FindManyOptions<User> = {
            select: ['id', 'name', 'email', 'phone', 'is_active'],
            order: { [sort_by]: sort_order },
            take: limit,
            skip: page ? (page - 1) * limit : 0,
        };

        if (search) {
            options.where = [
                { name: Like(`%${search}%`) },
                { email: Like(`%${search}%`) },
            ];
        }

        const [data, totalCount] = await this.usersRepository.findAndCount(options);

        return { data, totalCount };
    }
}
