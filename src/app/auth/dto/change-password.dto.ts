import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
    @ApiProperty({ example: 'oldPassword123', description: 'The old password' })
    @IsNotEmpty()
    @IsString()
    old_password: string;

    @ApiProperty({ example: 'newPassword456', description: 'The new password' })
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'password too weak',
    })
    new_password: string;
}
