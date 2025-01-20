"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { LoaderComponent } from "@/components/ui/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarSearchIcon, ListFilter } from "lucide-react";
import { Transaction, TransactionOrderType, TransactionPaymentPurpose, TransactionStatus } from "@/types/transaction.type";
import { rupiah } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";

export default function AdminDashboardTransaction() {
  const route = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const orderType = searchParams.get("orderType");
  const paymentPurpose = searchParams.get("paymentPurpose");
  const transactionStatus = searchParams.get("transactionStatus");
  const transactionTime = searchParams.get("transactionTime");
  const queryKey = ["transaction-list", orderType, paymentPurpose, transactionStatus, transactionTime].filter(Boolean);
  const queryParams = {
    ...(orderType && { orderType }),
    ...(paymentPurpose && { paymentPurpose }),
    ...(transactionStatus && { transactionStatus }),
    ...(transactionTime && { transactionTime }),
  };
  const queryString = new URLSearchParams(queryParams).toString();

  const { data, error, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch(`/api/transaction?${queryString}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.statusText);
      return result.data;
    },
    staleTime: 60 * 1000 * 5,
  });

  const transactionList: Transaction[] = data || [];

  function handleUpdateQueryParam(param: string, value: string) {
    const params = new URLSearchParams(searchParams);
    params.set(param, value);
    route.replace(`?${params.toString()}`);
  }

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="flex items-center">
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 gap-1">
                <CalendarSearchIcon className="size-5 sm:size-3.5 sm:mr-1.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Pick a date</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <Calendar
                mode="single"
                selected={new Date(Number(transactionTime) || "")}
                onSelect={(date) => handleUpdateQueryParam("transactionTime", String(date?.getTime()))}
                initialFocus
              />
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 gap-1">
                <ListFilter className="size-5 sm:size-3.5 sm:mr-1.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {[TransactionOrderType.RESERVATION, TransactionOrderType.ONLINEORDER].map((option) => (
                <DropdownMenuCheckboxItem
                  key={option}
                  onClick={() => handleUpdateQueryParam("orderType", option)}
                  checked={orderType === option}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              {[TransactionPaymentPurpose.DOWNPAYMENT, TransactionPaymentPurpose.PAID].map((option) => (
                <DropdownMenuCheckboxItem
                  key={option}
                  onClick={() => handleUpdateQueryParam("paymentPurpose", option)}
                  checked={paymentPurpose === option}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              {[
                TransactionStatus.PENDING,
                TransactionStatus.SETTLEMENT,
                TransactionStatus.DENY,
                TransactionStatus.CANCEL,
                TransactionStatus.EXPIRE,
                TransactionStatus.REFUND,
              ].map((option) => (
                <DropdownMenuCheckboxItem
                  key={option}
                  onClick={() => handleUpdateQueryParam("transactionStatus", option)}
                  checked={transactionStatus === option}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem onClick={() => route.replace(pathname)}>Clear Filter</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Transactions List</CardTitle>
          <CardDescription>Manage customer transaction list</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoaderComponent />
          ) : transactionList ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden md:table-cell">Transaction ID</TableHead>
                  <TableHead>Transaction Time</TableHead>
                  <TableHead>Order Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionList?.map((transaction) => (
                  <TableRow
                    key={transaction.transactionId}
                    className="cursor-pointer"
                    onClick={() => route.push(`${pathname}/${transaction.orderId}`)}
                  >
                    <TableCell className="hidden md:table-cell">{transaction.transactionId}</TableCell>
                    <TableCell>{formatDate(transaction.transactionTime, "long")}</TableCell>
                    <TableCell>{transaction.orderType.charAt(0).toUpperCase() + transaction.orderType.slice(1)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {transaction.transactionStatus.charAt(0).toUpperCase() + transaction.transactionStatus.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{rupiah.format(transaction.grossAmount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="w-full flex justify-center items-center p-5">
              <h1 className="text-lg md:text-xl lg:text-2xl">Error : {error?.message}</h1>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
