enum SeatingPreference {
  Indoor = "indoor",
  Outdoor = "outdoor",
}

enum PaymentStatus {
  DownPayment = "downPayment",
  Paid = "paid",
}

enum ReservationStatus {
  Pending = "pending",
  Confirmed = "confirmed",
  Cancelled = "cancelled",
}

export interface Reservation {
  _id: string;
  customerName: string;
  customerEmail: string;
  reservationDate: string;
  partySize: number;
  seatingPreference: SeatingPreference;
  specialRequest?: string;
  tableOnly: boolean;
  menus?: MenuSelection[];
  downPayment: number;
  discount: number;
  total: number;
  paymentStatus: PaymentStatus;
  reservationStatus: ReservationStatus;
  reasonCancellation?: string;
  reasonPending?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuSelection {
  productId: string;
  quantity: number;
}
