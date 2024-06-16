import { HttpException } from "@nestjs/common";
import { errorLog } from "./log.util";
import { _500 } from "./http-code.util";

export function successResponse(message: string = '', data: any = [], meta: any = null) {
    return {
        success: true,
        data,
        meta,
        message
    };
}

export function errorResponse(error) {
    let { message, status = _500 } = error;
    errorLog(message, error);
    throw new HttpException({ success: false, message: message }, status);
}

export class SuccessResponseDTO {
    success: boolean;
    data: any;
    meta: any;
    message: string
}

export class ErrorResponseDto {
    success: boolean;
    message: string;
    error?: Error | string
}

export type PromiseResponse = Promise<ErrorResponseDto | SuccessResponseDTO>;