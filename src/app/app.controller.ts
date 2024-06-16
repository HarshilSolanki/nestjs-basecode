import { Controller, Get, Post, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { successResponse, errorResponse, PromiseResponse } from 'src/utils/response.util';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ApiBody, ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { infoLog } from 'src/utils/log.util';
import { _YYYYMMDD, add_days, add_months, add_years, date_moment, format_date, sub_days, sub_months, sub_years } from 'src/utils/date.util';
import { _200 } from 'src/utils/http-code.util';
import { SendEmailDto, sendEmail } from 'src/utils/mail.util';
import { File, deleteFile, fileUpload } from 'src/utils/file.util';
import { FileValidationPipe } from 'src/utils/helper';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }

    @Get('hello')
    @ApiResponse({ status: _200, description: 'Getting welcome message successfully' })
    async getHello(@I18n() i18n: I18nContext): PromiseResponse {
        try {
            let data = await this.appService.getHello();
            infoLog('Log coming');
            return successResponse(i18n.t(`lang.welcome_message`), data);
        } catch (error) {
            errorResponse(error);
        }
    }

    @Get('favicon.ico')
    getFavicon() { }

    @Post('file-upload')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
    @ApiResponse({ status: 200, description: 'File upload successfully.' })
    async fileUpload(@I18n() i18n: I18nContext, @Request() req, @UploadedFile(FileValidationPipe) file: File): PromiseResponse {
        try {
            const user = req.user;
            const path = file ? fileUpload(file, 1) : null;
            console.log(['path', path]);
            return successResponse(i18n.t(`lang.file_upload`));
        } catch (error) {
            errorResponse(error);
        }
    }

    @Post('delete-file')
    @ApiResponse({ status: 200, description: 'File deleted successfully.' })
    async deleteFile(@I18n() i18n: I18nContext): PromiseResponse {
        try {
            const filePath = '1/csv/PAID-1680012944.csv';
            deleteFile(filePath);
            return successResponse(i18n.t(`lang.file_delete`));
        } catch (error) {
            errorResponse(error);
        }
    }

    @Get('mail-sent')
    @ApiResponse({ status: _200, description: 'Mail sent successfully.' })
    async mailSend(@I18n() i18n: I18nContext): PromiseResponse {
        try {
            const data = await this.appService.getHello();
            const obj: SendEmailDto = {
                to: ['harshilsolanki.ace@gmail.com'],
                subject: 'Testing Email',
                template: 'welcome',
                data: {
                    name: 'Heet Raithatha',
                    value: '$100',
                },
            };

            sendEmail(obj);
            return successResponse(i18n.t(`lang.mail_sent`), data);
        } catch (error) {
            errorResponse(error);
        }
    }

    @Get('date-function')
    @ApiResponse({ status: _200, description: 'Comman date function working successfully.' })
    async getCommanDate(@I18n() i18n: I18nContext): PromiseResponse {
        try {
            const today = date_moment();
            const days = 1;
            const data = {
                Today: today,
                string: date_moment('01/01/2025'),
                'Add Day': add_days(today, days),
                'Sub Day': sub_days(today, days),
                'Month Add': add_months(today, days),
                'Month Sub': sub_months(today, days),
                'Year Add': add_years(today, days),
                'Year Sub': sub_years(today, days),
                'Default Formate': format_date(),
                _YYYYMMDD: format_date(_YYYYMMDD),
            };
            return successResponse(i18n.t(`lang.date_checking`), data);
        } catch (error) {
            errorResponse(error);
        }
    }

}
