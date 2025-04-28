import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { FileService } from './file/file.service';

@Controller('upload')
export class AppController {
  constructor(
    private readonly fileService: FileService,
  ) { }

  @UseInterceptors(FileInterceptor('file'))
  @Post()
  async upload(@UploadedFile() file: Express.Multer.File) {

    const path = join(__dirname, '../', 'storage', 'uploads', `photo-${Date.now()}.png`);

    try {
      await this.fileService.upload(file, path);
      return { sucess: true }
    } catch (error) {
      throw new BadRequestException('Aconteceu um erro: ', error.message);
    }
  }

  @UseInterceptors(FilesInterceptor('files'))
  @Post('files')
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {

    return files;
  }

  @UseInterceptors(FileFieldsInterceptor([
    {
      name: 'photo',
      maxCount: 1,
    },
    {
      name: 'documents',
      maxCount: 10,
    }
  ]))
  @Post('files-fields')
  async uploadFilesFields(@UploadedFiles() files: { photo?: Express.Multer.File, documents?: Express.Multer.File[] }) {

    return files;
  }
}
