"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import { OnlineOrder, OnlineOrderStatus } from "@/types/order.type";
import { formatDate } from "@/lib/format-date";
import { rupiah } from "@/lib/format-currency";

export default function DashboardOnlineOrderList({
  deliveryDate,
  orderStatus,
  onlineOrderList,
  error,
  isLoading,
}: {
  deliveryDate: string | null;
  orderStatus: string | null;
  onlineOrderList: OnlineOrder[];
  error: Error | null;
  isLoading: boolean;
}) {
  const route = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
                selected={new Date(Number(deliveryDate) || "")}
                onSelect={(date) => handleUpdateQueryParam("deliveryDate", String(date?.getTime()))}
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
              {[
                OnlineOrderStatus.PENDING,
                OnlineOrderStatus.CONFIRMED,
                OnlineOrderStatus.PROCESSING,
                OnlineOrderStatus.SHIPPING,
                OnlineOrderStatus.DELIVERED,
                OnlineOrderStatus.CANCELLED,
              ].map((option) => (
                <DropdownMenuCheckboxItem
                  key={option}
                  onClick={() => handleUpdateQueryParam("orderStatus", option)}
                  checked={orderStatus === option}
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
          <CardTitle>Your Order</CardTitle>
          <CardDescription>Manage your Order</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoaderComponent />
          ) : onlineOrderList ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Delivery Date</TableHead>
                  <TableHead className="hidden md:table-cell">Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {onlineOrderList?.map((onlineOrder) => (
                  <TableRow
                    key={onlineOrder.orderId}
                    className="cursor-pointer"
                    onClick={() => route.push(`${pathname}/${onlineOrder.orderId}`)}
                  >
                    <TableCell>{onlineOrder.customerName}</TableCell>
                    <TableCell>{formatDate(onlineOrder.deliveryDate)}</TableCell>
                    <TableCell className="hidden md:table-cell">{onlineOrder.customerAddress}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {onlineOrder.orderStatus.charAt(0).toUpperCase() + onlineOrder.orderStatus.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{rupiah.format(onlineOrder.totalAmount)}</TableCell>
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
