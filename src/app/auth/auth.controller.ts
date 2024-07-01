import { Controller, Post, Body, Get, Request, NotFoundException, Param } from '@nestjs/common';
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
    @Post('master/user/registration')
    @ApiResponse({ status: _201, description: 'Master user registration successfully.' })
    async masterUserRegistration(@Body() masterUserRegistertDTO: MasterUserRegistertDTO, @I18n() i18n: I18nContext): Promise<PromiseResponse> {
        try {
            console.log(['check1']);
            const user = await this.authService.masterUserRegistration(masterUserRegistertDTO);
            console.log(['check2']);
            return successResponse(i18n.t(`lang.auth.tanant.register`), user);
        } catch (error) {
            errorResponse(error);
        }
    }

    @Post('tanant/user/registration')
    @ApiResponse({ status: _201, description: 'User registration successfully.' })
    @ApiResponse({ status: _404, description: 'User registration successfully.' })
    async tanantUserRegistration(@Request() req, request: Request, @Body() masterUserRegistertDTO: MasterUserRegistertDTO, @I18n() i18n: I18nContext): Promise<PromiseResponse> {
        try {
            const tanant = await this.authService.getTanantById(req.user.tanant_id);
            console.log(['user', req.user.tanant_id, tanant.db_name]);
            const user = await this.authService.tanantUserRegistration(masterUserRegistertDTO, tanant.db_name);
            return successResponse(i18n.t(`lang.auth.tanant.register`), user);
        } catch (error) {
            errorResponse(error);
        }
    }

    @Public()
    @Post('master/login')
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
    @Post('tanant/login/:tanantid')
    @ApiResponse({ status: _200, description: 'Master user logged in successfully.' })
    @ApiResponse({ status: _401, description: 'Invalid email or password.' })
    async tanantUserLogin(@Param('tanantid') tanantid: string, @Body() loginDto: LoginDto, @I18n() i18n: I18nContext): Promise<PromiseResponse> {
        try {
            const tanant = await this.authService.getTanantById(tanantid);
            const user = await this.authService.tanantUserLogin(loginDto, tanant.db_name);
            if (user) {
                return successResponse(i18n.t(`lang.auth.tanant.login`), user);
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
}
