import { IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';

export class UpdateReviewDto {
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Puan en az 1 olmalıdır' })
  @Max(5, { message: 'Puan en fazla 5 olabilir' })
  rating?: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
