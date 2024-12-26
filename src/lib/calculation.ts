import { ProductSelection } from "@/types/order.type"

export function getReservationDownPayment(
  reservationType: "table-only" | "include-food",
  paymentStatus: "downPayment" | "paid",
  total: number
): number {
  if (reservationType === "include-food") {
    return paymentStatus === "downPayment" ? total / 2 : total
  }
  return 30000
}

export function getSubtotal(items: ProductSelection[]): number {
  return items.reduce((acc, item) => acc + item.price * item.quantity, 0)
}

export function getDiscount(member: boolean, subtotal: number): number {
  const discount = 10 // 10 percent
  return !member ? 0 : (subtotal * discount) / 100
}

export function getShippingCost(): number {
  // soon
  return 0
}
