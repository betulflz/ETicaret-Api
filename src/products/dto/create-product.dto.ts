export class CreateProductDto {
  name: string;
  description: string;
  price: number;
  stock: number;
  
  // --- YENİ EKLENEN KISIM ---
  imageUrl?: string; // ? işareti "zorunlu değil" demek
}