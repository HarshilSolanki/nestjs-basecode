import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto {
    @ApiProperty({ description: 'Enter email', example: 'user@example.com' })
    @IsNotEmpty()
    @IsEmail()
    email: string;
}

export class ResetPasswordDto {
    @ApiProperty({ description: 'Enter token', example: 'adkfjksddgsadf' })
    @IsNotEmpty()
    token: string;

    @ApiProperty({ description: 'Enter new-password', example: 'newPassword123'})
    @IsNotEmpty()
    @IsString()
    new_password: string;
}
