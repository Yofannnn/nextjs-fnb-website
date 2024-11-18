export interface OnlineOrder {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  deliveryDate: Date;
  items: ProductSelection[];
  note?: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  totalAmount: number;
  transactionId: string;
  orderStatus:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipping"
    | "delivered"
    | "cancelled"
    | "expired";
  reasonCancellation?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductSelection {
  productId: string;
  quantity: number;
  price: number;
}
