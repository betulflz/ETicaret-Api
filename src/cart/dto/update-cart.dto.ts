import { IsNumber, Min } from 'class-validator';

export class UpdateCartDto {
  @IsNumber()
  @Min(1, { message: 'Miktar en az 1 olmalıdır' })
  quantity: number;
}
