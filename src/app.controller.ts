import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { FileService } from './file/file.service';

@Controller('upload')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly fileService: FileService,
  ) { }

  @UseInterceptors(FileInterceptor('file'))
  @Post()
  async upload(@UploadedFile() file: Express.Multer.File) {

    const path = join(__dirname, '../', 'storage', 'uploads', `photo-${Date.now()}.png`);

    this.fileService.upload(file, path);

    return { sucess: true }
  }
}
