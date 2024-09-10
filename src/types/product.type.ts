export interface Product {
  _id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  isAvailable: boolean;
  options?: string[];
  rating?: number[];
}
