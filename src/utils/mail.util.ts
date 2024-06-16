import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Attachment } from 'nodemailer/lib/mailer';
import { MailConfig } from 'src/config/mail.config';

@Injectable()
export class MailUtil {
    async sendEmailProcess(email: SendEmailDto) {
        try {
            const transporter: Mail = await nodemailer.createTransport(
                await MailConfig(),
            );

            const { from, template, data, ...fileds } = email;

            const path = join(__dirname, '..', 'templates', `${template}.hbs`);
            const html = email.data
                ? await this.replaceEmailVariables(path, email.data)
                : '';

            const options: Mail.Options = {
                ...fileds,
                from: from ?? process.env.MAIL_FROM,
                html: html,
            };

            await transporter.sendMail(options);
        } catch (error) {
            throw error;
        }
    }

    private async replaceEmailVariables(
        htmlPath: string,
        replacements: Record<string, string>,
    ) {
        const html = readFileSync(htmlPath, 'utf-8');
        return html.replace(/{{(\w*)}}/g, function (m, key) {
            return replacements.hasOwnProperty(key) ? replacements[key] : '';
        });
    }
}

export function sendEmail(email: SendEmailDto) {
    const emailUtil = new MailUtil();
    emailUtil.sendEmailProcess(email);
}

export class SendEmailDto {
    from?: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    template: string;
    data?: Record<string, string>;
    attachments?: Attachment[];
}
