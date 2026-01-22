import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('files')
export class FilesController {

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    // Depolama Ayarları
    storage: diskStorage({
      destination: './uploads', // Az önce oluşturduğumuz klasör
      filename: (req, file, callback) => {
        // Dosya ismini rastgele sayı yap (çakışmasın diye)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname); // Uzantıyı al (.jpg, .png)
        const filename = `${uniqueSuffix}${ext}`;
        callback(null, filename);
      },
    }),
    // Sadece Resim Kabul Et
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return callback(new BadRequestException('Sadece resim dosyaları yüklenebilir!'), false);
      }
      callback(null, true);
    },
  }))
  // 'any' demek: "TypeScript karışma, ben ne yaptığımı biliyorum" demektir.
  uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Dosya yüklenmedi!');
    }
    // Yükleme başarılı, resmin linkini dönüyoruz
    return {
      imageUrl: `http://localhost:3000/uploads/${file.filename}`
    };
  }
}