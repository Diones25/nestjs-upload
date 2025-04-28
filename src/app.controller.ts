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
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { extname, join } from 'path';
import { FileService } from './file/file.service';

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

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    
    const path = join(__dirname, '../', 'storage', 'uploads', `${file.fieldname}-${uniqueSuffix}${ext}`);

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

  // @UseInterceptors(FileFieldsInterceptor([
  //   {
  //     name: 'photo',
  //     maxCount: 1,
  //   },
  //   {
  //     name: 'documents',
  //     maxCount: 10,
  //   }
  // ]))
  // @Post('files-fields')
  // async uploadFilesFields(@UploadedFiles() files: { photo?: Express.Multer.File, documents?: Express.Multer.File[] }) {

  //   return files;
  // }
}
