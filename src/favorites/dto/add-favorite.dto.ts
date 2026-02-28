import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddFavoriteDto {
  @IsNotEmpty({ message: 'Ürün ID zorunludur' })
  @IsNumber()
  productId: number;
}
