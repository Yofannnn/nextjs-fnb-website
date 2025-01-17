import { DetailedProductSelection } from "@/types/product.type";

export interface Reservation {
  reservationId: string;
  customerName: string;
  customerEmail: string;
  reservationDate: Date;
  partySize: number;
  seatingPreference: ReservationSeatingPreference;
  specialRequest?: string;
  reservationType: ReservationType;
  menus?: DetailedProductSelection[];
  subtotal: number;
  discount: number;
  total: number;
  downPayment: number;
  transactionId: string;
  paymentStatus: ReservationPaymentStatus;
  reservationStatus: ReservationStatus;
  reasonCancellation?: string;
  reasonPending?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ReservationSeatingPreference {
  INDOOR = "indoor",
  OUTDOOR = "outdoor",
}

export enum ReservationType {
  TABLEONLY = "table-only",
  INCLUDEFOOD = "include-food",
}

export enum ReservationPaymentStatus {
  DOWNPAYMENT = "downPayment",
  PAID = "paid",
}

export enum ReservationStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  RESCHEDULED = "rescheduled",
  CANCELLED = "cancelled",
}

export interface InitializeReservationPayload {
  customerName: string;
  customerEmail: string;
  reservationDate: Date;
  partySize: number;
  seatingPreference: ReservationSeatingPreference;
  paymentStatus: ReservationPaymentStatus;
  specialRequest?: string | undefined;
  menus?: { productId: string; quantity: number }[];
}

export interface OnlineOrder {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  deliveryDate: Date;
  items: DetailedProductSelection[];
  note?: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  totalAmount: number;
  transactionId: string;
  orderStatus: OnlineOrderStatus;
  reasonCancellation?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum OnlineOrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PROCESSING = "processing",
  SHIPPING = "shipping",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
}

export interface InitializeOnlineOrderPayload {
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  deliveryDate: Date;
  items: { productId: string; quantity: number }[];
  note?: string;
}
