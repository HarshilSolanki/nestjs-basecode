import { Controller, Post, Body, Get, Request, NotFoundException, Param, Query, Headers, Delete } from '@nestjs/common';
import { MasterUserRegistertDTO } from './dto/registration.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { LoginDto } from './dto/login.dto';
import { Public } from 'src/decorators/public.decorator';
import { NoAuthRequire } from 'src/decorators/no-auth.decorator';
import { _200, _201, _401, _404 } from 'src/utils/http-code.util';
import { PromiseResponse, errorResponse, successResponse } from 'src/utils/response.util';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller()
@ApiBearerAuth()
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('tanant/create')
    @ApiResponse({ status: _201, description: 'Master user registration successfully.' })
    async masterUserRegistration(@Body() masterUserRegistertDTO: MasterUserRegistertDTO, @I18n() i18n: I18nContext): Promise<PromiseResponse> {
        try {
            const tanant = await this.authService.existTanant(masterUserRegistertDTO.name);
            if (tanant) {
                return successResponse(i18n.t(`lang.auth.tanant.exist`));
            }
            const user = await this.authService.masterUserRegistration(masterUserRegistertDTO);
            return successResponse(i18n.t(`lang.auth.tanant.register`), user);
        } catch (error) {
            errorResponse(error);
        }
    }

    @Post('user')
    @ApiResponse({ status: _201, description: 'User registration successfully.' })
    @ApiResponse({ status: _404, description: 'User not found.' })
    async tanantUserRegistration(@Request() req, request: Request, @Body() masterUserRegistertDTO: MasterUserRegistertDTO, @I18n() i18n: I18nContext): Promise<PromiseResponse> {
        try {
            const tanant = await this.authService.getTanantById(req.user.tanant_id);
            const user = await this.authService.tanantUserRegistration(masterUserRegistertDTO, tanant.db_name);
            return successResponse(i18n.t(`lang.auth.tanant.register`), user);
        } catch (error) {
            errorResponse(error);
        }
    }

    @Public()
    @Post('tanant/login')
    @ApiResponse({ status: _200, description: 'Master user logged in successfully.' })
    @ApiResponse({ status: _401, description: 'Invalid email or password.' })
    async masterLogin(@Body() loginDto: LoginDto, @I18n() i18n: I18nContext): Promise<PromiseResponse> {
        try {
            const user = await this.authService.signIn(loginDto);
            if (user) {
                return successResponse(i18n.t(`lang.auth.tanant.login`), user);
            }
            throw new NotFoundException(i18n.t(`lang.auth.login_credential_faild`));
        } catch (error) {
            errorResponse(error);
        }
    }

    @Public()
    @Post('user/login')
    @ApiResponse({ status: _200, description: 'Master user logged in successfully.' })
    @ApiResponse({ status: _401, description: 'Invalid email or password.' })
    async tanantUserLogin(@Headers('tanantid') tanantid: string, @Body() loginDto: LoginDto, @I18n() i18n: I18nContext): Promise<PromiseResponse> {
        try {
            const tanant = await this.authService.getTanantBySubdomain(tanantid, true);
            if (tanant) {
                const user = await this.authService.tanantUserLogin(loginDto, tanant.db_name);
                if (user) {
                    return successResponse(i18n.t(`lang.auth.tanant.login`), user);
                }
            }
            throw new NotFoundException(i18n.t(`lang.auth.login_credential_faild`));
        } catch (error) {
            errorResponse(error);
        }
    }

    @NoAuthRequire()
    @Get('user')
    @ApiResponse({ status: _200, description: 'User getting successfully.' })
    @ApiResponse({ status: _401, description: 'Unauthorized' })
    async getUser(@Request() req, @I18n() i18n: I18nContext) {
        try {
            return successResponse(i18n.t(`lang.auth.user_fetch`), req.user);
        } catch (error) {
            errorResponse(error);
        }
    }

    @NoAuthRequire()
    @Get('tanant/status/update')
    @ApiResponse({ status: 200, description: 'Tanant status updated successfully.' })
    @ApiResponse({ status: 404, description: 'Tanant not found.' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async updateTanantStatus(
        @Query('subdomain') subdomain: string,
        @Query('is_active') isActive: boolean,
        @I18n() i18n: I18nContext
    ) {
        try {
            const tanant = await this.authService.getTanantBySubdomain(subdomain);
            if (tanant) {
                await this.authService.updateTanantStatus(subdomain, isActive);
                return successResponse(i18n.t('lang.auth.tanant.status_updated'));
            }
            throw new NotFoundException(i18n.t(`lang.auth.tanant.not_found`));
        } catch (error) {
            return errorResponse(error);
        }
    }

    @NoAuthRequire()
    @Delete('tanant/delete')
    @ApiResponse({ status: 200, description: 'Tanant deleted successfully.' })
    @ApiResponse({ status: 404, description: 'Tanant not found.' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async deleteTanant(
        @Query('subdomain') subdomain: string,
        @I18n() i18n: I18nContext
    ) {
        try {
            const tanant = await this.authService.getTanantBySubdomain(subdomain);
            if (tanant) {
                await this.authService.deleteTanant(subdomain);
                return successResponse(i18n.t('lang.auth.tanant.deleted'));
            }
            throw new NotFoundException(i18n.t('lang.auth.tanant.not_found'));
        } catch (error) {
            return errorResponse(error);
        }
    }
}
