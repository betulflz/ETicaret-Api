import { IsNumber, Min } from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  @Min(1)
  quantity: number;
}