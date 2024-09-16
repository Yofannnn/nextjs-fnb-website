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
  reviews?: string[];
  totalSales?: number;
  createdAt: Date;
  updatedAt: Date;
}
