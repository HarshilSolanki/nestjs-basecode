import { Injectable } from '@nestjs/common';
import { RegistertDTO } from './dto/registration.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ResetPasswordDto } from './dto/forget-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { TOKEN_EXPIRATION_MINUTES } from 'src/config/constant.config';
import { SendEmailDto, sendEmail } from 'src/utils/mail.util';
import { User } from 'src/app/user/user.entity';
import { plainToInstance } from 'class-transformer';
import { bcryptComparePassword, bcryptPassword, decrypt, encrypt, executeSql } from 'src/utils/helper';
import { add_minutes, date_moment, is_date_expire } from 'src/utils/date.util';
import { snake_case } from 'src/utils/string.util';
import { Tanant } from '../user/tanant.entity';
import { executePendingMigrations } from 'src/utils/db-connection.util';

@Injectable()
export class AuthService{
    constructor(
        private readonly jwtService: JwtService,
        @InjectRepository(Tanant) private tanantRepository: Repository<Tanant>,
        @InjectRepository(User) private userRepository: Repository<User>,
    ) { }

    async registration(registertDTO: RegistertDTO): Promise<User> {
        const subdomain = await snake_case(registertDTO.name);
        const db_name = 'tanant_' + subdomain + '_' + Date.now();

        let tanant = await this.tanantRepository.save({
            'name': registertDTO.name,
            'db_name': db_name,
            'subdomain': subdomain,
        });

        const fields = new User();
        fields.tanant_id = tanant.id;
        fields.name = registertDTO.name;
        fields.email = registertDTO.email;
        fields.phone = registertDTO.phone;
        fields.password = await bcryptPassword(registertDTO.password);
        let data = await this.userRepository.save(fields);
        await this.createDatabase(db_name);
        await executePendingMigrations(db_name, true);
        return plainToInstance(User, data);
    }

    async signIn(loginDto: LoginDto): Promise<object | boolean> {
        const user = await this.userRepository.createQueryBuilder('users')
            .select(['id', 'name', 'email', 'phone', 'is_active', 'password'])
            .where('email = :email', { email: loginDto.email })
            .andWhere('is_active = :isActive', { isActive: true })
            .getRawOne();

        if (user) {
            const isPasswordValid = await bcryptComparePassword(loginDto.password, user.password);
            if (isPasswordValid) {
                const token = await this.generateToken(user);
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    is_active: user.is_active,
                    token: token,
                };
            }
        }
        return false;
    }

    async generateToken(user): Promise<string> {
        const payload = {
            user_id: user.id,
            email: user.email,
            phone: user.phone,
            is_active: user.is_active,
        };
        return this.jwtService.signAsync(payload);
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const user = await this.userRepository.findOne({
            where: { email: email },
            select: ['id', 'name', 'email', 'phone', 'is_active']
        });
        return user;
    }

    async forgetPassword(email: string): Promise<boolean> {
        const user = await this.getUserByEmail(email);
        if (user) {
            const encryptedToken = encrypt(user.email);
            user.reset_token = encryptedToken;
            user.reset_token_date = date_moment();
            await this.userRepository.save(user);
            const emailDto: SendEmailDto = {
                to: [user.email],
                subject: 'Reset Your Password',
                template: 'forgot-password',
                data: {
                    name: user.name,
                    link: `${process.env.BASE_URL}/reset-password?token=${encryptedToken}`,
                },
            };
            await sendEmail(emailDto);
            return true;
        }
        return false;
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<boolean> {
        const { token, new_password } = resetPasswordDto;

        const email = await decrypt(token);
        const user = await this.userRepository.findOne({ where: { email: email } });
        if (user && user.reset_token && user.reset_token_date) {
            const expirationTime = add_minutes(
                date_moment(user.reset_token_date),
                TOKEN_EXPIRATION_MINUTES
            );
            const currentTime = date_moment();
            if (is_date_expire(currentTime, expirationTime)) {
                return false;
            }

            user.password = await bcryptPassword(new_password);
            user.updated_at = date_moment();
            user.reset_token = null;
            user.reset_token_date = null;
            await this.userRepository.save(user);
            return true;
        }
        return false;
    }

    async changePassword(changePasswordDto: ChangePasswordDto, id): Promise<boolean> {
        const user = await this.userRepository.findOne({ where: { id: id } });
        if (await bcryptComparePassword(changePasswordDto.old_password, user.password)) {
            const newHashedPassword = await bcryptPassword(changePasswordDto.new_password);
            user.password = newHashedPassword;
            await this.userRepository.save(user);
            return true;
        }
        return false;
    }

    async createDatabase(dbName: string): Promise<any> {
        return await executeSql(`CREATE DATABASE ${dbName}`);
    }

}
