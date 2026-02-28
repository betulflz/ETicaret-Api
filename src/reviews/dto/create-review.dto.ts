import { IsNotEmpty, IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty({ message: 'Ürün ID zorunludur' })
  @IsNumber()
  productId: number;

  @IsNotEmpty({ message: 'Puan zorunludur' })
  @IsNumber()
  @Min(1, { message: 'Puan en az 1 olmalıdır' })
  @Max(5, { message: 'Puan en fazla 5 olabilir' })
  rating: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsNotEmpty({ message: 'Yorum içeriği zorunludur' })
  @IsString()
  comment: string;
}
