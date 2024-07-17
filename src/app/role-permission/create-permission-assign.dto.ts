import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsMongoId } from 'class-validator';

export class CreatePermissionAssignDTO {
    @ApiProperty({ description: 'Enter role ID', example: '60b8d295f4d3f8271c23c8b5' })
    @IsNotEmpty()
    @IsMongoId()
    role_id: string;

    @ApiProperty({ description: 'Enter permission ID', example: '60b8d295f4d3f8271c23c8b6' })
    @IsNotEmpty()
    @IsMongoId()
    permission_id: string;
}
