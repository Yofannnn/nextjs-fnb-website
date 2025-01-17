import { ReservationPaymentStatus } from "@/types/order.type";
import { ProductSelection } from "@/types/product.type";

export function getReservationDownPayment(paymentStatus: ReservationPaymentStatus, total: number): number {
  return paymentStatus === ReservationPaymentStatus.DOWNPAYMENT ? total / 2 : total;
}

export function getSubtotal(items: ProductSelection[]): number {
  return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
}

export function getDiscount(member: boolean, subtotal: number): number {
  const discount = 10; // 10 percent
  return !member ? 0 : (subtotal * discount) / 100;
}

export function getShippingCost(): number {
  // soon
  return 0;
}
