"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { OnlineOrder, OnlineOrderStatus } from "@/types/order.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LoaderComponent } from "@/components/ui/loader";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { rupiah } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  Ellipsis,
  HourglassIcon,
  PackageCheckIcon,
  PackageIcon,
  PackageXIcon,
  TicketXIcon,
  TimerResetIcon,
  TruckIcon,
} from "lucide-react";
import Link from "next/link";

export default function DashboardOnlineOrderDetails({ orderId }: { orderId: string }) {
  const route = useRouter();
  const queryKey = ["online-order", orderId];
  const { data, error, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch(`/api/online-order/user/${orderId}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.statusText);
      return result.data;
    },
    staleTime: 60 * 1000 * 5,
  });

  const onlineOrderDetails = data as OnlineOrder;

  if (isLoading) return <LoaderComponent />;

  if (error)
    return (
      <div className="w-full h-svh flex justify-center items-center">
        <h1 className="text-center text-lg">Error: {error.message}</h1>
      </div>
    );

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        <div className="col-span-1 lg:col-span-3 flex justify-between items-center">
          <Button variant="outline" onClick={() => route.back()}>
            <ChevronLeft className="size-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Ellipsis className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Reschedule</DropdownMenuItem>
              <DropdownMenuItem>Cancel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="col-span-1 lg:col-span-2 grid gap-4 h-fit">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
              <CardDescription>Current Order Status</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-3 overflow-x-auto">
              <OrderStatusComponent status={onlineOrderDetails.orderStatus} />
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base md:text-xl">Items Summary</CardTitle>
              <CardDescription>
                Total items: {onlineOrderDetails.items.reduce((acc, cur) => acc + cur.quantity, 0)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs md:text-sm">
                  {onlineOrderDetails.items.map((product, i) => (
                    <TableRow key={i}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>
                        <h2>{product.title}</h2>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{rupiah.format(product.price)}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell className="text-end">{rupiah.format(product.price * product.quantity)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-1 grid gap-4 h-fit">
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-xl">Payment</CardTitle>
              <CardDescription>Final Payment Amount</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-xs md:text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{rupiah.format(onlineOrderDetails.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Discount(
                  {onlineOrderDetails.discount
                    ? Math.floor((onlineOrderDetails.discount * 100) / onlineOrderDetails.subtotal)
                    : "0"}
                  %)
                </span>
                <span>- {rupiah.format(onlineOrderDetails.discount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Shipping/Delivery</span>
                <span>
                  {onlineOrderDetails.shippingCost ? `+ ${rupiah.format(onlineOrderDetails.shippingCost)}` : "Free"}
                </span>
              </div>
              <Separator className="w-full h-px bg-muted-foreground my-2" />
              <div className="flex items-center justify-between font-semibold">
                <span>Total</span>
                <span>{rupiah.format(onlineOrderDetails.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-xl">Customer</CardTitle>
              <CardDescription>Information Details</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-1.5 text-xs md:text-sm">
              <div className="flex justify-between items-center">
                <span>Name</span>
                <span>{onlineOrderDetails.customerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Email</span>
                <span>{onlineOrderDetails.customerEmail}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Address</span>
                <span>{onlineOrderDetails.customerAddress}</span>
              </div>
            </CardContent>
          </Card>
          {onlineOrderDetails.note && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-xl">Note</CardTitle>
                <CardDescription />
              </CardHeader>
              <CardContent>
                <p className="text-xs md:text-sm">{onlineOrderDetails.note}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function OrderStatusComponent({ status }: { status: OnlineOrderStatus }) {
  if (status === OnlineOrderStatus.PENDING)
    return (
      <div className="grid gap-2 px-4 py-6 rounded-2xl bg-orange-500 w-full">
        <TimerResetIcon />
        <h4 className="text-lg font-semibold">Pending</h4>
        <p className="text-sm md:text-base">Your order is pending. Please finish your transaction.</p>
      </div>
    );

  if (status === OnlineOrderStatus.CANCELLED)
    return (
      <div className="grid gap-2 px-4 py-6 rounded-2xl bg-destructive w-full">
        <PackageXIcon />
        <h4 className="text-lg font-semibold text-destructive-foreground">Cancelled</h4>
        <p className="text-sm md:text-base text-destructive-foreground">Your order has been cancelled</p>
      </div>
    );

  if (status === OnlineOrderStatus.EXPIRED)
    return (
      <div className="grid gap-2 px-4 py-6 rounded-2xl bg-black w-full">
        <TicketXIcon />
        <h4 className="text-lg font-semibold">Expired</h4>
        <p className="text-sm md:text-base">Sorry, your order has been expired. Please create a new order.</p>
      </div>
    );

  if (status === OnlineOrderStatus.DELIVERED)
    return (
      <div className="grid gap-2 px-4 py-6 rounded-2xl bg-blue-600 w-full">
        <PackageCheckIcon />
        <h4 className="text-lg font-semibold ">Delivered</h4>
        <p className="text-sm md:text-base">Thank you for your order. Please rate our service.</p>
        <Link href="">Rate Now</Link>
      </div>
    );

  return (
    <>
      <div className="grid gap-2 bg-muted px-4 py-6 rounded-2xl basis-1/4">
        <PackageIcon className="size-5 md:size-6" />
        <p className="text-sm md:text-base">Confirmed</p>
        <div className="w-full h-1.5 rounded-full bg-green-500" />
      </div>
      <div className="grid gap-2 bg-muted px-4 py-6 rounded-2xl basis-1/4">
        <HourglassIcon className="size-5 md:size-6" />
        <p className="text-sm md:text-base">Processing</p>
        <div
          className={cn(
            "w-full h-1.5 rounded-full",
            status === OnlineOrderStatus.CONFIRMED ? "bg-gray-500" : "bg-green-500"
          )}
        />
      </div>
      <div className="grid gap-2 bg-muted px-4 py-6 rounded-2xl basis-1/4">
        <TruckIcon className="size-5 md:size-6" />
        <p className="text-sm md:text-base">Shipping</p>
        <div
          className={cn(
            "w-full h-1.5 rounded-full",
            status === OnlineOrderStatus.CONFIRMED || status === OnlineOrderStatus.PROCESSING
              ? "bg-gray-500"
              : "bg-green-500"
          )}
        />
      </div>
      <div className="grid gap-2 bg-muted px-4 py-6 rounded-2xl basis-1/4">
        <PackageCheckIcon className="size-5 md:size-6" />
        <p className="text-sm md:text-base">Delivered</p>
        <div
          className={cn(
            "w-full h-1.5 rounded-full",
            status === OnlineOrderStatus.CONFIRMED ||
              status === OnlineOrderStatus.PROCESSING ||
              status === OnlineOrderStatus.SHIPPING
              ? "bg-gray-500"
              : "bg-green-500"
          )}
        />
      </div>
    </>
  );
}
