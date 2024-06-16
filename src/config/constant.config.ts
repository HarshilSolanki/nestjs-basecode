import * as crypto from 'crypto';

export const MAIN_CONSTANT = {
    STATIC_FOLDER: 'public',
    OPEN_API_PATH: 'api',
    GLOB_PREFIX: 'api'
};

export const APP_CONFIG_CONSTANT = {
    GLOBAL: true,
    ENV_FILE_PATH: '.env'
}

export const SWAGGER_CONFIG_CONSTANT = {
    TITLE: 'NESTJS BASECODE',
    DESCRIPTION: 'The nestjs project APIs',
    VERSION: '1.0',
    TAGS_SORTER: 'alpha',
    DOC_EXPANSION: 'none',
}

export const I18N_CONFIG_CONSTANT = {
    FALLBACK_LANGUAGE: 'en',
    ROOT_FOLDER: '/i18n/'
}

export const PAGINATE = {
    PAGE: '1',
    LIMIT: '10'
}

export const FILE_CONSTANT = {
    ROOT_DIR: '/uploads/',
    IMAGE_DIR: '/image/',
    CSV_DIR: '/csv/',
    DOC_DIR: '/document/',
    IMAGE_SIZE: 1000000,
    DOC_SIZE: 2000000,
    CSV_SIZE: 500000,
    PDF_SIZE: 2000000,
};

export const JWT_TOKEN_EXPIRATION_TIME = '5h';
export const TOKEN_EXPIRATION_MINUTES = 15;

export const ENCRYPT_DECRYPT = {
    key: crypto.randomBytes(32),
    BINARY: crypto.randomBytes(16),
    ALGORITHM: 'aes-256-cbc',
}

export const NO_AUTH_REQUIRED = 'no_auth_required';