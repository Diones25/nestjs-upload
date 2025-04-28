import { BadRequestException, Injectable } from "@nestjs/common";
import { writeFile } from "fs/promises";
import { diskStorage } from "multer";
import { extname } from "path";

@Injectable()
export class FileService {

  async upload(file: Express.Multer.File, path: string) {
    await writeFile( path, file.buffer);
  }

  getMulterOptions() {
    return {
      storage: diskStorage({
        destination: './storage/photos',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|pdf)$/)) {
          return callback(new BadRequestException('Apenas imagens e PDFs são permitidos!'), false);
        }
        callback(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB por arquivo
    };
  }

  async processUploadedFiles(files: Express.Multer.File[] | undefined) {
    // Verifica se files é undefined ou não é um array
    if (!files || !Array.isArray(files)) {
      throw new BadRequestException('Nenhum arquivo foi enviado')
    }

    // Filtra arquivos inválidos (opcional)
    const validFiles = files.filter(file =>
      file &&
      file.originalname &&
      file.filename &&
      file.path &&
      file.size !== undefined
    );

    return {
      message: validFiles.length > 0
        ? 'Arquivos processados com sucesso!'
        : 'Nenhum arquivo válido foi recebido',
      files: validFiles.map(file => ({
        originalName: file.originalname,
        fileName: file.filename,
        path: file.path,
        size: file.size,
      })),
    };
  }
}
