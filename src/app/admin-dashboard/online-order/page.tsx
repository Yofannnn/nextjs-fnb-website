"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { LoaderComponent } from "@/components/ui/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarSearchIcon, ListFilterIcon } from "lucide-react";
import { OnlineOrder, OnlineOrderStatus } from "@/types/order.type";
import { formatDate } from "@/lib/format-date";
import { rupiah } from "@/lib/format-currency";

export default function AdminDashboardOnlineOrder() {
  const pathname = usePathname();
  const route = useRouter();
  const searchParams = useSearchParams();
  const deliveryDate = searchParams.get("deliveryDate");
  const orderStatus = searchParams.get("orderStatus");
  const queryKey = ["online-orders", deliveryDate, orderStatus].filter(Boolean);
  const queryParams = { ...(deliveryDate && { deliveryDate }), ...(orderStatus && { orderStatus }) };
  const queryString = new URLSearchParams(queryParams).toString();

  const { data, error, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch(`/api/online-order?${queryString}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.statusText);
      return result.data;
    },
    staleTime: 60 * 1000 * 5,
  });

  const onlineOrders = data as OnlineOrder[];

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
                <ListFilterIcon className="size-5 sm:size-3.5 sm:mr-1.5" />
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
                OnlineOrderStatus.DELIVERED,
                OnlineOrderStatus.SHIPPING,
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
          <CardTitle>Online Order</CardTitle>
          <CardDescription>Manage online order from customers.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoaderComponent />
          ) : onlineOrders ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Address</TableHead>
                  <TableHead className="hidden md:table-cell">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {onlineOrders?.map((order) => (
                  <TableRow
                    key={order.orderId}
                    className="cursor-pointer"
                    onClick={() => route.push(`${pathname}/${order.orderId}`)}
                  >
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{formatDate(order.deliveryDate)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-nowrap truncate">
                      {order.customerAddress.charAt(0).toUpperCase() + order.customerAddress.slice(1)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{rupiah.format(order.totalAmount)}</TableCell>
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
