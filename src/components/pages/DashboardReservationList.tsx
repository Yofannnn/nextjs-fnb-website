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
import { Reservation, ReservationStatus, ReservationType } from "@/types/order.type";
import { formatDate, formatTime } from "@/lib/format-date";
import { rupiah } from "@/lib/format-currency";

export default function DashboardReservationList({
  reservationDate,
  reservationType,
  reservationStatus,
  reservations,
  isLoading,
  error,
}: {
  reservationDate: string | null;
  reservationType: string | null;
  reservationStatus: string | null;
  reservations: Reservation[];
  isLoading: boolean;
  error: Error | null;
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
                selected={new Date(Number(reservationDate) || "")}
                onSelect={(date) => handleUpdateQueryParam("reservationDate", String(date?.getTime()))}
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
                ReservationStatus.CANCELLED,
                ReservationStatus.CONFIRMED,
                ReservationStatus.PENDING,
                ReservationStatus.RESCHEDULED,
              ].map((option) => (
                <DropdownMenuCheckboxItem
                  key={option}
                  onClick={() => handleUpdateQueryParam("reservationStatus", option)}
                  checked={reservationStatus === option}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              {[ReservationType.INCLUDEFOOD, ReservationType.TABLEONLY].map((option) => (
                <DropdownMenuCheckboxItem
                  key={option}
                  onClick={() => handleUpdateQueryParam("reservationType", option)}
                  checked={reservationType === option}
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
          <CardTitle>Your Reservations</CardTitle>
          <CardDescription>Manage your reservations</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoaderComponent />
          ) : reservations ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="hidden sm:table-cell">Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Seating</TableHead>
                  <TableHead className="hidden lg:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations?.map((reservation) => (
                  <TableRow
                    key={reservation.reservationId}
                    className="cursor-pointer"
                    onClick={() => route.push(`${pathname}/${reservation.reservationId}`)}
                  >
                    <TableCell>{reservation.customerName}</TableCell>
                    <TableCell>{formatDate(reservation.reservationDate)}</TableCell>
                    <TableCell className="hidden sm:table-cell">{formatTime(reservation.reservationDate)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {reservation.reservationStatus.charAt(0).toUpperCase() + reservation.reservationStatus.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {reservation.seatingPreference.charAt(0).toUpperCase() + reservation.seatingPreference.slice(1)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {reservation.reservationType
                        .split("-")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ")}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{rupiah.format(reservation.total)}</TableCell>
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