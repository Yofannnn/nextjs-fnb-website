import { Transaction } from "@/types/transaction.type";
import Link from "next/link";

export default function MemberTransactionListPage({
  transactionList,
}: {
  transactionList: Transaction[];
}) {
  return (
    <div className="border-2">
      <div>transaction</div>
      {transactionList.map((transaction, i) => (
        <Link
          href={`/dashboard/transaction/${transaction.orderId}`}
          key={i}
          className="bg-red-400"
        >
          <div>{transaction.orderId}</div>
          <div>{transaction.orderType}</div>
          <div>{transaction.settlementTime?.toString()}</div>
          <div>{transaction.grossAmount}</div>
        </Link>
      ))}
    </div>
  );
}
