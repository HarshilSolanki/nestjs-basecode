import { Controller, Get, Query } from '@nestjs/common';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { successResponse, errorResponse, PromiseResponse } from 'src/utils/response.util';
import { ListUserQuery } from './dto/list-user-query.dto';
import { _200, _201 } from 'src/utils/http-code.util';

@ApiTags('User')
@Controller('users')
export class UserController {

    constructor(private readonly userService: UserService) { }

    // @Get()
    // @ApiResponse({ status: _200, description: 'User list getting successfully.' })
    // async getUsers(@Query() queryParams: ListUserQuery, @I18n() i18n: I18nContext): PromiseResponse {
    //     try {
    //         const { data, totalCount } = await this.userService.getUsers(queryParams);
    //         queryParams['total_count'] = totalCount;
    //         return successResponse(i18n.t(`lang.user.list`), data, queryParams);
    //     } catch (error) {
    //         errorResponse(error);
    //     }
    // }
}
