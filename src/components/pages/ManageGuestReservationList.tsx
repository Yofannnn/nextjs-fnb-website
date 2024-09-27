"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Reservation } from "@/types/reservation.type";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ListFilter } from "lucide-react";
import { formatDate, toDateTime } from "@/lib/format-date";
import { rupiah } from "@/lib/format-currency";
import { useState } from "react";

export default function ManageGuestReservationListPage({
  token,
  reservationList,
}: {
  token: string;
  reservationList: Reservation[] | [];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<
    "confirmed" | "cancelled" | "pending" | ""
  >("");

  const sortedReservationList = filter
    ? reservationList.filter(
        (reservation) => reservation.reservationStatus === filter
      )
    : reservationList;

  return (
    <>
      <div className="w-full py-10 px-2">
        <Card className="max-w-[900px] mx-auto">
          <CardHeader className="px-7 flex flex-row justify-between">
            <div className="grid gap-2">
              <CardTitle>Reservation</CardTitle>
              <CardDescription>Recent your reservstion</CardDescription>
            </div>
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
                  onClick={() => setFilter("confirmed")}
                  checked={filter === "confirmed"}
                >
                  confirmed
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  onClick={() => setFilter("cancelled")}
                  checked={filter === "cancelled"}
                >
                  cancelled
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  onClick={() => setFilter("pending")}
                  checked={filter === "pending"}
                >
                  pending
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  onClick={() => setFilter("")}
                  checked={filter === ""}
                >
                  default
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Placement
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Party Size
                  </TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedReservationList.map((reservation, i) => (
                  <TableRow
                    key={i}
                    className={false ? "bg-accent my-4" : "my-4"}
                    onClick={() =>
                      router.push(
                        `/manage-reservation/${token}/${reservation._id}`
                      )
                    }
                  >
                    <TableCell>
                      {formatDate(
                        new Date(reservation.reservationDate),
                        "formatDateLong"
                      )}
                    </TableCell>
                    <TableCell>
                      {toDateTime(reservation.reservationDate).time}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge className="text-xs" variant="outline">
                        {reservation.reservationStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {reservation.seatingPreference}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {reservation.partySize} people
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
    </>
  );
}
