import { IsEnum, IsOptional, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginateDto } from 'src/utils/helper';
import { SortByUserKey } from '../user.entity';

export class ListUserQuery extends PaginateDto {
    @ApiProperty({ required: false, enum: SortByUserKey })
    @IsOptional()
    @ValidateIf((v) => v.order_by_key !== '')
    @IsEnum(SortByUserKey)
    sort_by: SortByUserKey;
}