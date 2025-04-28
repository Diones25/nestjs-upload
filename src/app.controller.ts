import {
  BadRequestException,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { extname, join } from 'path';
import { FileService } from './file/file.service';
import { mkdir, access } from 'fs/promises';
import { constants } from 'fs';

@Controller('upload')
export class AppController {
  constructor(
    private readonly fileService: FileService,
  ) { }

  @UseInterceptors(FileInterceptor('file'))
  @Post()
  async upload(
    @UploadedFile(new ParseFilePipe({
      validators: [
        new FileTypeValidator({
          fileType: 'image/jpeg|image/jpg|image/png',
        }),
        new MaxFileSizeValidator({
          maxSize: 5 * 1024 * 1024, // 5MB
        })
      ],
    })) file: Express.Multer.File
  ) {

    const uploadsDir = join(__dirname, '../', 'storage', 'uploads');

    try {
      // Verifica se o diretório existe, se não existir cria
      await access(uploadsDir, constants.F_OK).catch(async () => {
        await mkdir(uploadsDir, { recursive: true });
      });

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      const path = join(uploadsDir, `${file.fieldname}-${uniqueSuffix}${ext}`);

      await this.fileService.upload(file, path);
      return { sucess: true }
    } catch (error) {
      throw new BadRequestException('Aconteceu um erro: ', error.message);
    }
  }

  @Post('files')
  @UseInterceptors(FilesInterceptor('files', 10, new FileService().getMulterOptions()))
  async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    try {
      return this.fileService.processUploadedFiles(files);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
