"use client";

import {
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  File,
  ListFilter,
  MoreVertical,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Reservation } from "@/types/reservation.type";
import { formatDate, toDateTime } from "@/lib/format-date";
import { rupiah } from "@/lib/format-currency";

export default function UserDashboardReservation() {
  const [reservationList, setReservationList] = useState<Reservation[]>([]);
  const [displayReservationDetails, setDisplayReservationDetails] =
    useState<Reservation | null>(null);
  const [filterByReservationStatus, setFilterByReservationStatus] = useState<
    "confirmed" | "cancelled" | "pending" | ""
  >("");
  const sortedReservationList = filterByReservationStatus
    ? reservationList.filter(
        (reservation) =>
          reservation.reservationStatus === filterByReservationStatus
      )
    : reservationList;
  const indexDisplayReservationDetails = reservationList.findIndex(
    (reservation) => reservation._id === displayReservationDetails?._id
  );

  useEffect(() => {
    async function getReservationList() {
      try {
        const res = await fetch("/api/reservation/admin", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error(res.statusText);
        const { data } = await res.json();
        setReservationList(data);
      } catch (error: any) {
        console.log(error.message);
      }
    }

    getReservationList();
  }, []);

  return (
    <>
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 text-sm"
                >
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  onClick={() => setFilterByReservationStatus("confirmed")}
                  checked={filterByReservationStatus === "confirmed"}
                >
                  confirmed
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  onClick={() => setFilterByReservationStatus("cancelled")}
                  checked={filterByReservationStatus === "cancelled"}
                >
                  cancelled
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  onClick={() => setFilterByReservationStatus("pending")}
                  checked={filterByReservationStatus === "pending"}
                >
                  pending
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  onClick={() => setFilterByReservationStatus("")}
                  checked={filterByReservationStatus === ""}
                >
                  default
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" className="h-7 gap-1 text-sm">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only">Export</span>
            </Button>
          </div>
          <Card>
            <CardHeader className="px-7">
              <CardTitle>Orders</CardTitle>
              <CardDescription>Recent orders from your store.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedReservationList.map((reservation, i) => (
                    <TableRow
                      key={i}
                      className={
                        reservation._id === displayReservationDetails?._id
                          ? "bg-accent"
                          : ""
                      }
                      onClick={() => setDisplayReservationDetails(reservation)}
                    >
                      <TableCell>
                        <div className="font-medium">
                          {reservation.customerName}
                        </div>
                        <div className="hidden text-sm text-muted-foreground md:inline">
                          {reservation.customerEmail}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        Sale
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge className="text-xs" variant="secondary">
                          {reservation.reservationStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        2023-06-23
                      </TableCell>
                      <TableCell className="text-right">
                        {rupiah.format(reservation.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-start bg-muted/50 overflow-x-hidden">
              <div className="grid gap-0.5">
                <CardTitle className="group flex items-center gap-2 text-sm">
                  Order{" "}
                  {displayReservationDetails
                    ? displayReservationDetails._id
                    : "-"}
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Copy className="h-3 w-3" />
                    <span className="sr-only">Copy Order ID</span>
                  </Button>
                </CardTitle>
                <CardDescription className="text-xs">
                  {displayReservationDetails &&
                    formatDate(
                      displayReservationDetails.createdAt,
                      "formatDateLong"
                    )}
                </CardDescription>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="outline" className="h-8 w-8">
                      <MoreVertical className="h-3.5 w-3.5" />
                      <span className="sr-only">More</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Export</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Trash</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-6 text-sm">
              <div className="grid gap-3">
                <div className="font-semibold">Order Details</div>
                <ul className="grid gap-3">
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Reservation Date
                    </span>
                    <span>
                      {displayReservationDetails
                        ? toDateTime(displayReservationDetails.reservationDate)
                            .date
                        : "-"}
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Reservation Time
                    </span>
                    <span>
                      {displayReservationDetails
                        ? toDateTime(displayReservationDetails.reservationDate)
                            .time
                        : "-"}
                    </span>
                  </li>
                </ul>
                <Separator className="my-2" />
                <ul className="grid gap-3">
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Downpayment</span>
                    <span>
                      {displayReservationDetails
                        ? displayReservationDetails.downPayment
                        : "-"}
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span>
                      {displayReservationDetails
                        ? displayReservationDetails.discount
                        : "-"}
                    </span>
                  </li>
                  <li className="flex items-center justify-between font-semibold">
                    <span className="text-muted-foreground">Total</span>
                    <span>
                      {displayReservationDetails
                        ? displayReservationDetails.total
                        : "-"}
                    </span>
                  </li>
                </ul>
              </div>
              <Separator className="my-4" />
              <div className="grid gap-3">
                <div className="font-semibold">Customer Information</div>
                <dl className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Customer</dt>
                    <dd>
                      {displayReservationDetails
                        ? displayReservationDetails.customerName
                        : "-"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Email</dt>
                    <dd>
                      {displayReservationDetails
                        ? displayReservationDetails.customerName
                        : "-"}
                    </dd>
                  </div>
                </dl>
              </div>
              <Separator className="my-4" />
              <div className="grid gap-3">
                <div className="font-semibold">Payment Information</div>
                <dl className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1 text-muted-foreground">
                      <CreditCard className="h-4 w-4" />
                      Visa
                    </dt>
                    <dd>**** **** **** 4532</dd>
                  </div>
                </dl>
              </div>
            </CardContent>
            <CardFooter className="flex flex-row justify-between items-center border-t bg-muted/50 px-6 py-3">
              <div className="text-xs text-muted-foreground">
                Updated{" "}
                <time dateTime="2023-11-23">
                  {displayReservationDetails
                    ? formatDate(
                        displayReservationDetails.updatedAt,
                        "formatDateLong"
                      )
                    : "-"}
                </time>
              </div>
              <div className="flex justify-between items-center gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-6 w-6"
                  onClick={() =>
                    setDisplayReservationDetails(
                      reservationList[indexDisplayReservationDetails - 1]
                    )
                  }
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span className="sr-only">Previous Order</span>
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-6 w-6"
                  onClick={() =>
                    setDisplayReservationDetails(
                      reservationList[indexDisplayReservationDetails + 1]
                    )
                  }
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className="sr-only">Next Order</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </>
  );
}
