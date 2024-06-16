import { join } from 'path';
import * as fs from 'fs';
import { directoryMap, dir } from '../config/file.config';

export type File = Express.Multer.File;

export interface MultipleFiles {
    [key: string]: File;
}

const directory = (mimetype: string): string => {
    return directoryMap[mimetype];
};

const createDirectory = (path: string) => {
    if (!fs.existsSync(path)) {
        try {
            fs.mkdirSync(path, { recursive: true });
        } catch (error) {
            throw Error('Error occurred while creating folder');
        }
    }
};

// function to upload the file (form can have only one file field and at most one file can be uploaded at once)
const fileUpload = (file: File, id: number) => {
    const folderName = directory(file.mimetype);
    const folder = join(dir, id.toString(), folderName);
    createDirectory(folder);

    const path = folder + file.originalname;
    try {
        fs.writeFileSync(path, file.buffer);
        return path;
    } catch (error) {
        throw new Error(error);
    }
};

// Function to remove a file
const deleteFile = (filePath: string): void => {
    try {
        fs.unlinkSync('uploads/' + filePath);
    } catch (error) {
        throw new Error(error);
    }
};
// function to upload the array of file (form having a single file field but multiple files can be uploaded at once)
const fileUploads = (files: Array<File>, id: number) => {
    return files.map((file) => fileUpload(file, id));
};

export { fileUpload, fileUploads, deleteFile };
