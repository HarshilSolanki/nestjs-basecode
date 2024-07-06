import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';
// import { isUnique } from 'src/decorators/is-unique.decorator';

export class MasterUserRegistertDTO {
    @ApiProperty({ description: 'Enter user name', example: 'Jhon Doe', })
    @IsNotEmpty()
    @Length(0, 20)
    name: string;

    @ApiProperty({ description: 'Enter user email address', example: 'jhon.doe@gmail.com', })
    @IsNotEmpty()
    @IsEmail()
    // @isUnique({ tableName: 'users', column: 'email' })
    @Length(0, 30)
    email: string;

    @ApiProperty({ description: 'Enter user phone number', example: '7894561231', })
    @IsNotEmpty()
    @Length(0, 15)
    phone: string;

    // @ApiProperty({ description: 'Enter user password', example: 'Password@123', })
    // @IsNotEmpty()
    // @Length(8, 24)
    // @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    //     message: 'password too weak',
    // })
    // password: string;
}