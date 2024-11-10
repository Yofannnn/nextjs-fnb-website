export type Transaction = {
  transactionId: string;
  orderId: string;
  orderType: "reservation" | "online-order";
  grossAmount: number;
  currency?: string;
  vaNumbers?: { bank: string; vaNumber: string }[];
  paymentAmounts?: { amount: number; paidAt: Date }[];
  paymentType?: string;
  paymentPurpose: "downPayment" | "paid";
  transactionStatus:
    | "settlement"
    | "pending"
    | "expire"
    | "deny"
    | "cancel"
    | "refund";
  transactionTime: Date;
  settlementTime?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type TransactionSuccess = {
  status_code: number;
  status_message: string;
  transaction_id: string;
  order_id: string;
  gross_amount: number;
  payment_type: string;
  transaction_time: string;
  transaction_status: "settlement" | "pending" | "expire" | "deny" | "cancel";
  fraud_status: "accept" | "deny" | "challenge";
  finish_redirect_url: string;
};
