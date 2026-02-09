import { Controller, Get, Post, Body, Patch, Put, Param, Delete, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        const filename = `${uniqueSuffix}${ext}`;
        callback(null, filename);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return callback(new BadRequestException('Sadece resim dosyaları yüklenebilir!'), false);
      }
      callback(null, true);
    },
  }))
  create(@Body() createProductDto: CreateProductDto, @UploadedFile() image?: any) {
    // DEBUG: Request data'sını kontrol et
    console.log('=== ÜRÜN EKLEME REQUEST ===');
    console.log('Body data:', createProductDto);
    console.log('Image file:', image ? {
      filename: image.filename,
      originalname: image.originalname,
      mimetype: image.mimetype,
      size: image.size
    } : 'Resim yok');
    
    // Eğer resim yüklendiyse, imageUrl'i oluştur ve DTO'ya ekle
    if (image) {
      createProductDto.imageUrl = `http://localhost:3000/uploads/${image.filename}`;
      console.log('ImageUrl set to:', createProductDto.imageUrl);
    }
    
    console.log('Final DTO before service:', createProductDto);
    console.log('=== END REQUEST ===\n');
    
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        const filename = `${uniqueSuffix}${ext}`;
        callback(null, filename);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return callback(new BadRequestException('Sadece resim dosyaları yüklenebilir!'), false);
      }
      callback(null, true);
    },
  }))
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() image?: any,
  ) {
    console.log('=== ÜRÜN GÜNCELLEME REQUEST ===');
    console.log('ID:', id);
    console.log('Body data:', updateProductDto);
    console.log('Image file:', image ? {
      filename: image.filename,
      originalname: image.originalname,
      mimetype: image.mimetype,
      size: image.size
    } : 'Resim yok');
    
    if (image) {
      updateProductDto.imageUrl = `http://localhost:3000/uploads/${image.filename}`;
      console.log('ImageUrl set to:', updateProductDto.imageUrl);
    }
    
    console.log('Final DTO before service:', updateProductDto);
    console.log('=== END UPDATE REQUEST ===\n');
    
    return this.productsService.update(+id, updateProductDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        const filename = `${uniqueSuffix}${ext}`;
        callback(null, filename);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return callback(new BadRequestException('Sadece resim dosyaları yüklenebilir!'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB
    },
  }))
  updatePut(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() image?: any,
  ) {
    console.log('\n🔵 ============================================');
    console.log('🔵 PUT REQUEST ALINDI! ID:', id);
    console.log('🔵 ============================================');
    console.log('📦 Body data:', JSON.stringify(updateProductDto, null, 2));
    console.log('📷 Image file:', image ? {
      filename: image.filename,
      originalname: image.originalname,
      mimetype: image.mimetype,
      size: image.size,
      path: image.path
    } : '❌ RESIM YOK!');
    
    if (image) {
      updateProductDto.imageUrl = `http://localhost:3000/uploads/${image.filename}`;
      console.log('✅ ImageUrl güncellendi:', updateProductDto.imageUrl);
    } else {
      console.log('⚠️  Resim gönderilmedi, mevcut resim korunacak');
    }
    
    console.log('🔵 Service\'e gönderilecek final data:', JSON.stringify(updateProductDto, null, 2));
    console.log('🔵 ============================================\n');
    
    return this.productsService.update(+id, updateProductDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}