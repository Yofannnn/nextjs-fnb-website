import { Transaction } from "@/types/transaction.type";
import Link from "next/link";

export default function GuestTransactionListPage({
  token,
  transactions,
}: {
  token: string;
  transactions: Transaction[];
}) {
  return (
    <div className="grid gap-4">
      {transactions.map((transaction) => (
        <Link
          href={`/guest/transaction/${token}/${transaction.orderId}`}
          key={transaction.transactionId}
          className="text-foreground underline underline-offset-4"
        >
          {transaction.transactionId}
        </Link>
      ))}
    </div>
  );
}
