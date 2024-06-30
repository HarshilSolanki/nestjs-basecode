import { Controller, Post, Body, Get, Request, NotFoundException, ConflictException, Param, Headers } from '@nestjs/common';
import { MasterUserRegistertDTO } from './dto/registration.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forget-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
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
    async tanantUserRegistration(@Headers('x-tenant-id') tenantId: string, @Body() masterUserRegistertDTO: MasterUserRegistertDTO, @I18n() i18n: I18nContext): Promise<PromiseResponse> {
        try {
            const user = await this.authService.tanantUserRegistration(masterUserRegistertDTO);
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
    @Post('tanant/login/:tanant')
    @ApiResponse({ status: _200, description: 'Master user logged in successfully.' })
    @ApiResponse({ status: _401, description: 'Invalid email or password.' })
    async tanantUserLogin(@Headers('x-tenant-id') tenantId: string, @Body() loginDto: LoginDto, @I18n() i18n: I18nContext): Promise<PromiseResponse> {
        try {
            const user = await this.authService.tanantUserLogin(loginDto);
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
            console.log(['test', req.user]);
            // const user = await this.authService.getUserByEmail(req.user.email);
            // if (user) {
            return successResponse(i18n.t(`lang.auth.user_fetch`), req.user);
            // }
            throw new NotFoundException(i18n.t(`lang.auth.not_found`));
        } catch (error) {
            errorResponse(error);
        }
    }

    // @Public()
    // @NoAuthRequire()
    // @Post('forget-password')
    // @ApiResponse({ status: _200, description: 'Password reset mail sent successfully.' })
    // async forgetPassword(@Body() forgotPasswordDto: ForgotPasswordDto, @I18n() i18n: I18nContext): Promise<PromiseResponse> {
    //     try {
    //         const isEmailSent = await this.authService.forgetPassword(forgotPasswordDto.email);
    //         if (isEmailSent) {
    //             return successResponse(i18n.t(`lang.auth.forget_password`));
    //         }
    //         throw new NotFoundException(i18n.t(`lang.auth.email_not_found`));
    //     } catch (error) {
    //         errorResponse(error);
    //     }
    // }

    // @Public()
    // @NoAuthRequire()
    // @Post('reset-password')
    // @ApiResponse({ status: _200, description: 'Password reset successfully.' })
    // async resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @I18n() i18n: I18nContext): Promise<PromiseResponse> {
    //     try {
    //         const resetPasswordResult = await this.authService.resetPassword(resetPasswordDto);
    //         if (resetPasswordResult) {
    //             return successResponse(i18n.t(`lang.auth.reset_password`));
    //         }
    //         throw new NotFoundException(i18n.t(`lang.auth.reset_password_fail`));
    //     } catch (error) {
    //         errorResponse(error);
    //     }
    // }

    // @NoAuthRequire()
    // @Post('change-password')
    // @ApiResponse({ status: _200, description: 'Password changed successfully.' })
    // @ApiResponse({ status: _401, description: 'Unauthorized.' })
    // async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Request() req, @I18n() i18n: I18nContext): Promise<PromiseResponse> {
    //     try {
    //         const loggedUser = req.user;
    //         const user = await this.authService.changePassword(changePasswordDto, loggedUser.user_id);
    //         if (user) {
    //             return successResponse(i18n.t(`lang.auth.change_password_success`), user);
    //         }
    //         throw new NotFoundException(i18n.t(`lang.auth.change_password_fail`));
    //     } catch (error) {
    //         errorResponse(error);
    //     }
    // }
}
