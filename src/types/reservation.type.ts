export interface Reservation {
  reservationId: string;
  customerName: string;
  customerEmail: string;
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  seatingPreference: string;
  specialRequest?: string;
  tableOnly: boolean;
  menus?: MenuSelection[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuSelection {
  productId: string;
  title: string;
  price: number;
  quantity: number;
}
