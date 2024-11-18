"use client";

import { Transaction } from "@/types/transaction.type";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { rupiah } from "@/lib/format-currency";
import { useRouter } from "next/navigation";

export default function MemberTransactionListPage({
  transactionList,
}: {
  transactionList: Transaction[];
}) {
  const router = useRouter();
  const capitalize = (string: string, separator: "-" | "_"): string => {
    return string
      .split(separator)
      .map((word) =>
        word
          .split("")
          .map((letter, i) => (i === 0 ? letter.toUpperCase() : letter))
          .join("")
      )
      .join(" ");
  };

  return (
    <>
      <div className="w-full flex flex-col justify-center items-center gap-6 px-4 py-6 overflow-x-hidden">
        <h1 className="text-2xl font-semibold">Transaction List</h1>
        <div className="max-w-[700px]">
          <Table>
            <TableCaption>A list of your recent invoices.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden md:table-cell">Invoice</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs md:text-sm">
              {transactionList.map((transaction, i) => (
                <TableRow
                  key={i}
                  className="cursor-pointer"
                  onClick={() =>
                    router.push(`/dashboard/transaction/${transaction.orderId}`)
                  }
                >
                  <TableCell className="hidden md:table-cell">
                    {transaction.transactionId}
                  </TableCell>
                  <TableCell>
                    {transaction.orderType
                      ? capitalize(transaction.orderType as string, "-")
                      : "-"}
                  </TableCell>
                  <TableCell>{transaction.transactionStatus}</TableCell>
                  <TableCell>
                    {transaction.paymentType
                      ? capitalize(transaction.paymentType as string, "_")
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {rupiah.format(transaction.grossAmount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
