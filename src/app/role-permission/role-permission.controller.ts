import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolePermissionService } from './role-permission.service';
import { _200, _201, _409 } from 'src/utils/http-code.util';
import { I18n, I18nContext } from 'nestjs-i18n';
import { errorResponse, PromiseResponse, successResponse } from 'src/utils/response.util';
import { CreateRoleDTO } from './create-role.dto';
import { CreatePermissionAssignDTO } from './create-permission-assign.dto';
import { CreateUserRoleAssignDTO } from './create-user-role-assign.dto';
import { Permission } from 'src/decorators/permission.decorator';
import { UpdateRoleDTO } from './update-role.dto';

@ApiTags('Role-Permission')
@Controller()
@ApiBearerAuth()
export class RolePermissionController {
    constructor(private readonly rolePermissionService: RolePermissionService) { }

    @Get('tanant/role/list')
    @Permission('role.list')
    @ApiResponse({ status: _200, description: 'Roles getting successfully.' })
    async tanantRoles(@Request() req, @I18n() i18n: I18nContext): Promise<PromiseResponse> {
        try {
            let db_name = req.user.db_name;
            const roles = await this.rolePermissionService.getTanantRoles(db_name);
            return successResponse(i18n.t(`lang.auth.tanant.role.list`), roles);
        } catch (error) {
            errorResponse(error);
        }
    }

    @Post('tanant/role/create')
    @Permission('role.create')
    @ApiResponse({ status: _201, description: 'Role created successfully.' })
    @ApiResponse({ status: _409, description: 'Role already exist.' })
    async tanantRoleCreate(@Request() req, @Body() createRoleDTO: CreateRoleDTO, @I18n() i18n: I18nContext): Promise<PromiseResponse> {
        try {
            let db_name = req.user.db_name;
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

    @Put('tanant/role/update')
    @Permission('role.edit')
    @ApiResponse({ status: _200, description: 'Role updated successfully.' })
    async tanantRoleUpdate(@Request() req, @Body() updateRoleDTO: UpdateRoleDTO, @I18n() i18n: I18nContext): PromiseResponse {
        try {
            let db_name = req.user.db_name;
            const data = await this.rolePermissionService.tanantRoleUpdate(db_name, updateRoleDTO);
            return successResponse(i18n.t(`lang.auth.tanant.role.update`), data);
        } catch (error) {
            errorResponse(error);
        }
    }

    @Delete('tanant/role/delete/:id')
    @Permission('role.delete')
    @ApiResponse({ status: _200, description: 'Role deleted successfully.' })
    async tanantRoleDelete(@Request() req, @Param('id') id: string, @I18n() i18n: I18nContext): PromiseResponse {
        try {
            let db_name = req.user.db_name;
            await this.rolePermissionService.tanantRoleDelete(db_name, id);
            return successResponse(i18n.t(`lang.auth.tanant.role.delete`));
        } catch (error) {
            errorResponse(error);
        }
    }

    @Get('tanant/permission/list')
    @Permission('permission.list')
    @ApiResponse({ status: _200, description: 'Permissions getting successfully.' })
    async tanantPermissions(@Request() req, @I18n() i18n: I18nContext): Promise<PromiseResponse> {
        try {
            let db_name = req.user.db_name;
            const permissions = await this.rolePermissionService.getTanantPermissions(db_name);
            return successResponse(i18n.t(`lang.auth.tanant.permission.list`), permissions);
        } catch (error) {
            errorResponse(error);
        }
    }

    @Post('assign/role/permission')
    @Permission('permission.assign')
    @ApiResponse({ status: _201, description: 'Permission assign to role successfully.' })
    @ApiResponse({ status: _409, description: 'Permission already assigned.' })
    async assignRolePermission(@Request() req, @Body() createPermissionAssignDTO: CreatePermissionAssignDTO, @I18n() i18n: I18nContext): Promise<PromiseResponse> {
        try {
            let db_name = req.user.db_name;
            await this.rolePermissionService.assignRolePermissions(createPermissionAssignDTO.permission_ids, createPermissionAssignDTO.role_id, db_name);
            return successResponse(i18n.t(`lang.auth.tanant.role.create`));
        } catch (error) {
            errorResponse(error);
        }
    }

    @Post('assign/user/role')
    @Permission('role.assign')
    @ApiResponse({ status: _201, description: 'User assign to role successfully.' })
    @ApiResponse({ status: _409, description: 'User role already assigned.' })
    async assignUserRole(@Request() req, @Body() createUserRoleAssignDTO: CreateUserRoleAssignDTO, @I18n() i18n: I18nContext): Promise<PromiseResponse> {
        try {
            let db_name = req.user.db_name;
            const assignUserRoleExist = await this.rolePermissionService.getAssignUserRole(createUserRoleAssignDTO.user_id, createUserRoleAssignDTO.role_id, db_name);
            if (assignUserRoleExist) {
                throw new BadRequestException(i18n.t(`lang.auth.tanant.user.asign`));
            }
            await this.rolePermissionService.assignUserRole(createUserRoleAssignDTO.user_id, createUserRoleAssignDTO.role_id, db_name);
            return successResponse(i18n.t(`lang.auth.tanant.user.create`));
        } catch (error) {
            errorResponse(error);
        }
    }
}
