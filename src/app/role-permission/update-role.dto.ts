import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';

export class UpdateRoleDTO {
    @ApiProperty({ description: 'Enter role id', example: '1', })
    @IsNotEmpty()
    @Length(0, 30)
    id: number;

    @ApiProperty({ description: 'Enter role name', example: 'admin', })
    @IsNotEmpty()
    @Length(0, 20)
    name: string;
}