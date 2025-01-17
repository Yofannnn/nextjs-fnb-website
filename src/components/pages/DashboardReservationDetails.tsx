"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Reservation, ReservationStatus } from "@/types/order.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LoaderComponent } from "@/components/ui/loader";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeftIcon, Copy, EllipsisIcon } from "lucide-react";
import { formatDate, formatTime } from "@/lib/format-date";
import { rupiah } from "@/lib/format-currency";

export default function DashboardReservationDetails({ reservationId }: { reservationId: string }) {
  const route = useRouter();
  const queryKey = ["reservation", reservationId];
  const { data, error, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch(`/api/reservation/user/${reservationId}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.statusText);
      return result.data;
    },
    staleTime: 60 * 1000 * 5,
  });

  const reservation = data as Reservation;

  if (isLoading) return <LoaderComponent />;

  if (error)
    return (
      <div className="w-full h-svh flex justify-center items-center">
        <p className="text-lg text-center">Error: {error.message}</p>
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {reservation.reservationStatus === ReservationStatus.PENDING && (
        <div className="bg-orange-500 col-span-1 md:col-span-2 p-4 rounded-lg">
          <h1 className="text-lg md:text-xl mb-4">Your reservation pending now. Please complete the transaction first </h1>
          <Button variant="ghost">Complete transaction now</Button>
        </div>
      )}
      {reservation.reservationStatus === ReservationStatus.CANCELLED && (
        <div className="bg-destructive text-destructive-foreground col-span-1 md:col-span-2 p-4 rounded-lg">
          <h1 className="text-lg md:text-xl mb-4">Your reservation was cancelled.</h1>
          <Button variant="ghost" onClick={() => route.back()}>
            <ArrowLeftIcon className="size-4 mr-2" />
            Back
          </Button>
        </div>
      )}
      <Card className="col-span-1 h-fit overflow-hidden">
        <CardHeader className="flex flex-row justify-between items-start bg-muted/50">
          <div className="grid gap-0.5">
            <CardTitle className="group flex items-center gap-2 text-sm md:text-lg">
              Order ID #{reservation.reservationId}
              <Button size="icon" variant="outline" className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100">
                <Copy className="h-3 w-3" />
                <span className="sr-only">Copy Order ID</span>
              </Button>
            </CardTitle>
            <CardDescription>Reservation {reservation.reservationStatus}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                <EllipsisIcon className="size-5 md:size-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Reschedule</DropdownMenuItem>
              <DropdownMenuItem>Cancel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="p-6 text-sm">
          <div className="grid gap-3">
            <div className="font-semibold">Order Details</div>
            <ul className="grid gap-3">
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Reservation Date</span>
                <span>{formatDate(new Date(reservation.reservationDate), "short")}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Reservation Time</span>
                <span>{formatTime(reservation.reservationDate)}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Party Size</span>
                <span>{reservation.partySize} People</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Seating Preference</span>
                <span>{reservation.seatingPreference.charAt(0).toUpperCase() + reservation.seatingPreference.slice(1)}</span>
              </li>
            </ul>
            <Separator className="my-2" />
            <ul className="grid gap-3">
              {reservation.downPayment !== reservation.total && (
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Down Payment</span>
                  <span>{rupiah.format(reservation.downPayment)}</span>
                </li>
              )}
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{rupiah.format(reservation.subtotal)}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Discounts</span>
                <span>- {rupiah.format(reservation.discount)}</span>
              </li>
              <li className="flex items-center justify-between font-semibold">
                <span className="text-muted-foreground">Total</span>
                <span>{rupiah.format(reservation.total)}</span>
              </li>
            </ul>
          </div>
          <Separator className="my-4" />
          <div className="grid gap-3">
            <div className="font-semibold">Customer Information</div>
            <dl className="grid gap-3">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Name</dt>
                <dd>{reservation.customerName}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Email</dt>
                <dd>{reservation.customerEmail}</dd>
              </div>
            </dl>
          </div>
        </CardContent>
        <CardFooter className="flex items-center border-t bg-muted/50 px-6 py-3">
          <div className="text-xs text-muted-foreground">
            Updated <time dateTime="2023-11-23">{formatDate(reservation.updatedAt, "short")}</time>
          </div>
        </CardFooter>
      </Card>
      <div className="col-span-1 h-fit grid gap-4">
        {reservation.specialRequest && (
          <Card>
            <CardHeader>
              <CardTitle>Special Request</CardTitle>
              <CardDescription />
            </CardHeader>
            <CardContent className="text-sm">{reservation.specialRequest}</CardContent>
          </Card>
        )}
        <Card className="h-fit overflow-x-auto">
          {!reservation.menus?.length ? (
            <div className="text-center tetx-xl py-5">You reserve table only</div>
          ) : (
            <>
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription />
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Id</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservation.menus.map((menu) => (
                      <TableRow key={menu.productId}>
                        <TableCell className="text-nowrap truncate">{menu.productId}</TableCell>
                        <TableCell>{menu.quantity}</TableCell>
                        <TableCell>{rupiah.format(menu.price)}</TableCell>
                        <TableCell>{rupiah.format(menu.price * menu.quantity)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
