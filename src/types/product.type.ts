export interface Product {
  // _id: string;
  productId: string;
  title: string;
  price: number;
  description: string;
  category: ProductCategory;
  image: string;
  isAvailable: boolean;
  options?: string[];
  reviews?: {
    userId: string;
    rating: number;
    review: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  totalSales?: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum ProductCategory {
  FOOD = "food",
  DRINK = "drink",
  SNACK = "snack",
}
