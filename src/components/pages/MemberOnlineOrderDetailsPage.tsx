import { OnlineOrder } from "@/types/online-order.type";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { Product } from "@/types/product.type";
import { rupiah } from "@/lib/format-currency";
import { Separator } from "../ui/separator";
import {
  HourglassIcon,
  PackageCheckIcon,
  PackageIcon,
  PackageXIcon,
  TicketXIcon,
  TimerResetIcon,
  TruckIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderItems extends Product {
  quantity: number;
}

export default function MemberOnlineOrderDetailsPage({
  onlineOrderDetails,
  orderItems,
}: {
  onlineOrderDetails: OnlineOrder;
  orderItems: OrderItems[];
}) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-4">
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
              <CardTitle className="text-base md:text-xl">
                Items Summary
              </CardTitle>
              <CardDescription>
                Total items:{" "}
                {orderItems.reduce((acc, cur) => acc + cur.quantity, 0)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Price
                    </TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs md:text-sm">
                  {orderItems.map((product, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Image
                            src={product.image}
                            alt={product.title}
                            width={100}
                            height={100}
                            className="w-[50px] object-cover aspect-square pointer-events-none rounded-md"
                          />
                          <h2>{product.title}</h2>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {rupiah.format(product.price)}
                      </TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell className="text-end">
                        {rupiah.format(product.price * product.quantity)}
                      </TableCell>
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
                    ? Math.floor(
                        (onlineOrderDetails.discount * 100) /
                          onlineOrderDetails.subtotal
                      )
                    : "0%"}
                  %)
                </span>
                <span>- {rupiah.format(onlineOrderDetails.discount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Shipping/Delivery</span>
                <span>
                  {onlineOrderDetails.shippingCost
                    ? `+ ${rupiah.format(onlineOrderDetails.shippingCost)}`
                    : "Free"}
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
              <div className="flex justify-between items-center">
                <span>Note</span>
                <span>{onlineOrderDetails.note}</span>
              </div>
            </CardContent>
          </Card>
          {onlineOrderDetails.note && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-xl">Note</CardTitle>
                <CardDescription />
              </CardHeader>
              <CardContent>{onlineOrderDetails.note}</CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

const OrderStatusComponent = ({
  status,
}: {
  status: OnlineOrder["orderStatus"];
}) => {
  if (status === "pending")
    return (
      <div className="grid gap-2 px-4 py-6 rounded-2xl bg-orange-500 w-full">
        <TimerResetIcon />
        <h4 className="text-lg font-semibold">Pending</h4>
        <p className="text-sm">
          Your order is pending. Please finish your transaction.
        </p>
      </div>
    );

  if (status === "cancelled")
    return (
      <div className="grid gap-2 px-4 py-6 rounded-2xl bg-destructive w-full">
        <PackageXIcon />
        <h4 className="text-lg font-semibold text-destructive-foreground">
          Cancelled
        </h4>
        <p className="text-sm text-destructive-foreground">
          Your order has been cancelled
        </p>
      </div>
    );

  if (status === "expired")
    return (
      <div className="grid gap-2 px-4 py-6 rounded-2xl bg-black w-full">
        <TicketXIcon />
        <h4 className="text-lg font-semibold">Expired</h4>
        <p className="text-sm">
          Sorry, your order has been expired. Please create a new order.
        </p>
      </div>
    );

  return (
    <>
      <div className="grid gap-2 bg-muted px-4 py-6 rounded-2xl w-3/12">
        <PackageIcon />
        <p>Confirmed</p>
        <div className="w-full h-1.5 rounded-full bg-green-500" />
      </div>
      <div className="grid gap-2 bg-muted px-4 py-6 rounded-2xl w-3/12">
        <HourglassIcon />
        <p>Processing</p>
        <div
          className={cn(
            "w-full h-1.5 rounded-full",
            status === "confirmed" ? "bg-gray-500" : "bg-green-500"
          )}
        />
      </div>
      <div className="grid gap-2 bg-muted px-4 py-6 rounded-2xl w-3/12">
        <TruckIcon />
        <p>Shipping</p>
        <div
          className={cn(
            "w-full h-1.5 rounded-full",
            status === "confirmed" || status === "processing"
              ? "bg-gray-500"
              : "bg-green-500"
          )}
        />
      </div>
      <div className="grid gap-2 bg-muted px-4 py-6 rounded-2xl w-3/12">
        <PackageCheckIcon />
        <p>Delivered</p>
        <div
          className={cn(
            "w-full h-1.5 rounded-full",
            status === "confirmed" ||
              status === "processing" ||
              status === "shipping"
              ? "bg-gray-500"
              : "bg-green-500"
          )}
        />
      </div>
    </>
  );
};
