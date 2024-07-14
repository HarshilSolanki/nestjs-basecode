import { BadRequestException, Body, Controller, Get, Post, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolePermissionService } from './role-permission.service';
import { _200, _201, _409 } from 'src/utils/http-code.util';
import { I18n, I18nContext } from 'nestjs-i18n';
import { errorResponse, PromiseResponse, successResponse } from 'src/utils/response.util';
import { CreateRoleDTO } from './create-role.dto';

@ApiTags('Role-Permission')
@Controller()
@ApiBearerAuth()
export class RolePermissionController {
    constructor(private readonly rolePermissionService: RolePermissionService) { }

    @Get('tanant/role/list')
    @ApiResponse({ status: _200, description: 'Roles getting successfully.' })
    async tanantRoles(@Request() req, @I18n() i18n: I18nContext): Promise<PromiseResponse> {
        try {
            let db_name =  req.user.db_name;
            const roles = await this.rolePermissionService.getTanantRoles(db_name);
            return successResponse(i18n.t(`lang.auth.tanant.role.list`), roles);
        } catch (error) {
            errorResponse(error);
        }
    }

    @Post('tanant/role/create')
    @ApiResponse({ status: _201, description: 'Role created successfully.' })
    @ApiResponse({ status: _409, description: 'Role already exist.' })
    async tanantRoleCreate(@Request() req, @Body() createRoleDTO: CreateRoleDTO, @I18n() i18n: I18nContext): Promise<PromiseResponse> {
        try {
            let db_name =  req.user.db_name;
            const roleExist = await this.rolePermissionService.getTanantRole(createRoleDTO.name, db_name);
            if (roleExist) {
                throw new BadRequestException(i18n.t(`lang.auth.tanant.role.exist`));
            }
            const role = await this.rolePermissionService.tanantRoleCreate(createRoleDTO.name, db_name);
            return successResponse(i18n.t(`lang.auth.tanant.role.create`), role);
        } catch (error) {
            errorResponse(error);
        }
    }

    @Get('tanant/permission/list')
    @ApiResponse({ status: _200, description: 'Permissions getting successfully.' })
    async tanantPermissions(@Request() req, @I18n() i18n: I18nContext): Promise<PromiseResponse> {
        try {
            let db_name =  req.user.db_name;
            const permissions = await this.rolePermissionService.getTanantPermissions(db_name);
            return successResponse(i18n.t(`lang.auth.tanant.permission.list`), permissions);
        } catch (error) {
            errorResponse(error);
        }
    }
}
