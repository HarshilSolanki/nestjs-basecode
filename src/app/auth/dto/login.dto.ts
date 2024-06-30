import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @ApiProperty({ description: 'Enter email', example: 'admin@test.com' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'Enter password', example: 'Password@123' })
    @IsNotEmpty()
    @IsString()
    password: string;
}
