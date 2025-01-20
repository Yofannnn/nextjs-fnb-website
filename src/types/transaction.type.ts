export type Transaction = {
  transactionId: string;
  orderId: string;
  orderType: TransactionOrderType;
  grossAmount: number;
  currency?: string;
  vaNumbers?: { bank: string; vaNumber: string }[];
  paymentAmounts?: { amount: number; paidAt: Date }[];
  paymentType?: string;
  paymentPurpose: TransactionPaymentPurpose;
  transactionStatus: TransactionStatus;
  transactionTime: Date;
  settlementTime?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export enum TransactionOrderType {
  RESERVATION = "reservation",
  ONLINEORDER = "online-order",
}

export enum TransactionStatus {
  SETTLEMENT = "settlement",
  PENDING = "pending",
  EXPIRE = "expire",
  DENY = "deny",
  CANCEL = "cancel",
  REFUND = "refund",
}

export enum TransactionPaymentPurpose {
  DOWNPAYMENT = "downPayment",
  PAID = "paid",
}

export interface InitializeTransactionPayload {
  orderId: string;
  orderType: TransactionOrderType;
  grossAmount: number;
  paymentPurpose: TransactionPaymentPurpose;
  transactionStatus: TransactionStatus;
  transactionTime: Date;
  paymentType?: string | undefined;
}

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

export interface MidtransTransactionDetails {
  status_code: string;
  transaction_id: string;
  gross_amount: string;
  currency: string;
  order_id: string;
  payment_type: string;
  signature_key: string;
  transaction_status: string;
  fraud_status: string;
  status_message: string;
  merchant_id: string;
  va_numbers: { bank: string; va_number: string }[];
  payment_amounts: { amount: string; paid_at: string }[];
  transaction_time: string;
  settlement_time: string;
  expiry_time: string;
}
