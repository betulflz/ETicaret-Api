import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class AddToCartDto {
  @IsNotEmpty({ message: 'Ürün ID\'si zorunludur' })
  @IsNumber()
  productId: number;

  @IsNotEmpty({ message: 'Miktar zorunludur' })
  @IsNumber()
  @Min(1, { message: 'Miktar en az 1 olmalıdır' })
  quantity: number;
}
