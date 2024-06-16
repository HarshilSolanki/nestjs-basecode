import { Controller, Post, Body, Get, Request, NotFoundException, ConflictException } from '@nestjs/common';
import { RegistertDTO } from './dto/registration.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forget-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from 'src/decorators/public.decorator';
import { NoAuthRequire } from 'src/decorators/no-auth.decorator';
import { _200, _201, _401 } from 'src/utils/http-code.util';
import { PromiseResponse, errorResponse, successResponse } from 'src/utils/response.util';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller()
@ApiBearerAuth()
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('registration')
    @ApiResponse({ status: _201, description: 'User registration successfully.' })
    async registration(@Body() registertDTO: RegistertDTO, @I18n() i18n: I18nContext): Promise<PromiseResponse> {
        try {
            const user = await this.authService.registration(registertDTO);
            return successResponse(i18n.t(`lang.auth.register`), user);
        } catch (error) {
            errorResponse(error);
        }
    }

    @Public()
    @Post('login')
    @ApiResponse({ status: _200, description: 'User Logedin successfully.' })
    @ApiResponse({ status: _401, description: 'Invalid email or password.' })
    async login(@Body() loginDto: LoginDto, @I18n() i18n: I18nContext): Promise<PromiseResponse> {
        try {
            const user = await this.authService.signIn(loginDto);
            if (user) {
                return successResponse(i18n.t(`lang.auth.login`), user);
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
            const user = await this.authService.getUserByEmail(req.user.email);
            if (user) {
                return successResponse(i18n.t(`lang.auth.user_fetch`), user);
            }
            throw new NotFoundException(i18n.t(`lang.auth.not_found`));
        } catch (error) {
            errorResponse(error);
        }
    }

    @Public()
    @NoAuthRequire()
    @Post('forget-password')
    @ApiResponse({ status: _200, description: 'Password reset mail sent successfully.' })
    async forgetPassword(@Body() forgotPasswordDto: ForgotPasswordDto, @I18n() i18n: I18nContext): Promise<PromiseResponse> {
        try {
            const isEmailSent = await this.authService.forgetPassword(forgotPasswordDto.email);
            if (isEmailSent) {
                return successResponse(i18n.t(`lang.auth.forget_password`));
            }
            throw new NotFoundException(i18n.t(`lang.auth.email_not_found`));
        } catch (error) {
            errorResponse(error);
        }
    }

    @Public()
    @NoAuthRequire()
    @Post('reset-password')
    @ApiResponse({ status: _200, description: 'Password reset successfully.' })
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @I18n() i18n: I18nContext): Promise<PromiseResponse> {
        try {
            const resetPasswordResult = await this.authService.resetPassword(resetPasswordDto);
            if (resetPasswordResult) {
                return successResponse(i18n.t(`lang.auth.reset_password`));
            }
            throw new NotFoundException(i18n.t(`lang.auth.reset_password_fail`));
        } catch (error) {
            errorResponse(error);
        }
    }

    @NoAuthRequire()
    @Post('change-password')
    @ApiResponse({ status: _200, description: 'Password changed successfully.' })
    @ApiResponse({ status: _401, description: 'Unauthorized.' })
    async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Request() req, @I18n() i18n: I18nContext): Promise<PromiseResponse> {
        try {
            const loggedUser = req.user;
            const user = await this.authService.changePassword(changePasswordDto, loggedUser.user_id);
            if (user) {
                return successResponse(i18n.t(`lang.auth.change_password_success`), user);
            }
            throw new NotFoundException(i18n.t(`lang.auth.change_password_fail`));
        } catch (error) {
            errorResponse(error);
        }
    }
}
