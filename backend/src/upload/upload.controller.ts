import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@Controller('upload')
export class UploadController {
  constructor(@InjectQueue('file-processing') private fileQueue: Queue) {}
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(
            Math.random() * 1e9,
          )}`;
          const fileExtName = extname(file.originalname);
          cb(null, `${uniqueSuffix}${fileExtName}`);
        },
      }),
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() data: { password: string },
  ) {
    if (data.password !== process.env.UPLOAD_PASSWORD) {
      console.warn('Wrong password. File wile be removed.');

      fs.rm(`./uploads/${file.filename}`, (err) => {
        if (err === null) {
          console.log('File removed');
        } else {
          console.log('Error while removing file: ', err);
        }
      });

      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Wrong password.',
        },
        HttpStatus.FORBIDDEN,
        {
          cause: 'Wrong password.',
        },
      );
    }

    try {
      await this.fileQueue.add('unzip-file', {
        filePath: `./uploads/${file.filename}`,
      });
      return {
        message: 'File uploaded and processing started!',
        filename: file.filename,
      };
    } catch (error) {
      console.error('Error uploading file', error);
      throw new InternalServerErrorException('Error uploading file');
    }
  }
}
