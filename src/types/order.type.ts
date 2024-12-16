export interface Reservation {
  reservationId: string;
  customerName: string;
  customerEmail: string;
  reservationDate: Date;
  partySize: number;
  seatingPreference: "indoor" | "outdoor";
  specialRequest?: string;
  reservationType: "table-only" | "include-food";
  menus?: ProductSelection[];
  subtotal: number;
  discount: number;
  total: number;
  downPayment: number;
  transactionId: string;
  paymentStatus: "downPayment" | "paid";
  reservationStatus: "pending" | "confirmed" | "rescheduled" | "cancelled";
  reasonCancellation?: string;
  reasonPending?: string;
  createdAt: Date;
  updatedAt: Date;
}

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
