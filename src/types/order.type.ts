// Type for selected menu items in orders that include food
export type MenuSelection = {
  productId: string;
  quantity: number;
  price: number;
};

// Base Order type to allow shared fields for Reservation and Online Order
interface BaseOrder {
  customerName: string;
  customerEmail: string;
  paymentStatus: "downPayment" | "paid";
  downPayment: number;
  discount: number;
  total: number;
  transactionId: string;
  reasonCancellation?: string;
  reasonPending?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Reservation type extends BaseOrder
export interface Reservation extends BaseOrder {
  reservationId: string;
  reservationDate: Date;
  reservationType: "table-only" | "include-food";
  seatingPreference: "indoor" | "outdoor";
  partySize: number;
  specialRequest?: string;
  menus?: MenuSelection[]; // Only applicable if reservationType is "include-food"
  reservationStatus: "pending" | "confirmed" | "rescheduled" | "cancelled";
}

// OnlineOrder type extends BaseOrder
export interface OnlineOrder extends BaseOrder {
  orderType: "online-order";
  menus: MenuSelection[];
  specialRequest?: string;
}
