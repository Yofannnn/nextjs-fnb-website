import { Transaction } from "@/types/transaction.type";

export default function MemberTransactionDetailsPage({
  transaction,
}: {
  transaction: Transaction;
}) {
  return (
    <div>
      <div>{transaction.orderId}</div>
      <div>{transaction.orderType}</div>
      <div>{transaction.transactionStatus}</div>
    </div>
  );
}
