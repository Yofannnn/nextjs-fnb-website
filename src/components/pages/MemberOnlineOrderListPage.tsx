"use client";

import { OnlineOrder } from "@/types/online-order.type";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { rupiah } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";

export default function MemberOnlineOrderListPage({
  onlineOrderList,
}: {
  onlineOrderList: OnlineOrder[];
}) {
  const router = useRouter();

  return (
    <div className="w-full flex flex-col justify-center items-center gap-6 px-4 py-6 overflow-x-hidden">
      <h1 className="text-2xl font-semibold">Online Order List</h1>
      <div className="max-w-[700px]">
        <Table>
          <TableCaption>A list of your recent orders.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden md:table-cell">ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs md:text-sm">
            {onlineOrderList.map((order, i) => (
              <TableRow
                key={i}
                className="cursor-pointer"
                onClick={() =>
                  router.push(`/dashboard/online-order/${order.orderId}`)
                }
              >
                <TableCell className="hidden md:table-cell">
                  {order.orderId}
                </TableCell>
                <TableCell>
                  {order.orderStatus
                    .split("")
                    .map((char, i) => (i === 0 ? char.toUpperCase() : char))
                    .join("")}
                </TableCell>
                <TableCell>
                  {formatDate(order.createdAt, "short")}
                </TableCell>
                <TableCell className="text-right">
                  {rupiah.format(order.totalAmount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
