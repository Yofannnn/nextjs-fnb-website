"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDate, toDateTime } from "@/lib/format-date";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  BookX,
  CalendarCheck2,
  Copy,
  CopyIcon,
  CreditCard,
  SquareArrowOutUpRight,
  TimerReset,
} from "lucide-react";
import { Reservation } from "@/types/reservation.type";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import {
  cancelReservationAction,
  pendingReservationAction,
  updateReservationAction,
} from "@/actions/reservation.action";
import { useParams, useRouter } from "next/navigation";
import { rupiah } from "@/lib/format-currency";

export default function GuestReservationDetailsPage({
  reservation,
}: {
  reservation: Reservation;
}) {
  const [isFormOpen, setIsFormOpen] = useState<
    "update" | "cancel" | "pending" | ""
  >("");

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3 my-3 md:my-8">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row justify-between items-start bg-muted/50">
            <div className="grid gap-0.5">
              <CardTitle className="group flex items-center gap-2 text-sm md:text-lg">
                Order {reservation._id}
                <Button
                  size="icon"
                  variant="outline"
                  className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Copy className="h-3 w-3" />
                  <span className="sr-only">Copy Order ID</span>
                </Button>
              </CardTitle>
              <CardDescription>
                {formatDate(new Date(reservation.createdAt), "formatDateLong")}
              </CardDescription>
            </div>
            <div>
              <InviteFriendsButton />
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
                    {formatDate(
                      new Date(reservation.reservationDate),
                      "formatDateLong"
                    )}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Reservation Time
                  </span>
                  <span>{toDateTime(reservation.reservationDate).time}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Party Size</span>
                  <span>{reservation.partySize} people</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Seating Preference
                  </span>
                  <span>{reservation.seatingPreference}</span>
                </li>
                {reservation.specialRequest && (
                  <li className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Special Request
                    </span>
                    <span>{reservation.specialRequest}</span>
                  </li>
                )}
              </ul>
              <Separator className="my-2" />
              <ul className="grid gap-3">
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Down Payment</span>
                  <span>{rupiah.format(reservation.downPayment)}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Discounts</span>
                  <span>-</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{rupiah.format(reservation.total)}</span>
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
                  <dt className="text-muted-foreground">Customer</dt>
                  <dd>{reservation.customerName}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd>{reservation.customerEmail}</dd>
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
          <CardFooter className="flex items-center border-t bg-muted/50 px-6 py-3">
            <div className="text-xs text-muted-foreground">
              Updated{" "}
              <time dateTime="2023-11-23">
                {formatDate(reservation.updatedAt, "formatDateLong")}
              </time>
            </div>
          </CardFooter>
        </Card>
      </div>
      <div className="grid gap-4">
        <UpdateReservationComponent
          reservation={reservation}
          isFormOpen={isFormOpen}
          setIsFormOpen={setIsFormOpen}
        />
        <PendingReservationComponent
          isFormOpen={isFormOpen}
          setIsFormOpen={setIsFormOpen}
        />
        <CancelReservationComponent
          isFormOpen={isFormOpen}
          setIsFormOpen={setIsFormOpen}
        />
      </div>
    </div>
  );
}

function UpdateReservationComponent({
  reservation,
  isFormOpen,
  setIsFormOpen,
}: {
  reservation: Reservation;
  isFormOpen: "update" | "cancel" | "pending" | "";
  setIsFormOpen: Dispatch<SetStateAction<"update" | "cancel" | "pending" | "">>;
}) {
  const { token, id } = useParams<{ token: string; id: string }>();
  const useUpdateReservation = updateReservationAction.bind(null, {
    isMember: false,
    token,
    reservationId: id,
  });
  const [state, action] = useFormState(useUpdateReservation, {});
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      setIsFormOpen("");
      router.refresh();
    }
  }, [router, setIsFormOpen, state.success]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-start gap-3 items-center">
            Reschedule Reservation <CalendarCheck2 />
          </CardTitle>
          <CardDescription>
            Lipsum dolor sit amet, consectetur adipiscing elit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsFormOpen("update")}
            >
              Reschedule Reservation
            </Button>
          </div>
          {isFormOpen === "update" && (
            <div className="mt-7">
              <form id="update" action={action}>
                <div className="mb-6">
                  <h1 className="text-sm font-bold text-center md:text-start">
                    Reservation
                  </h1>
                  <p className="text-muted-foreground text-sm text-center md:text-start">
                    Please fill out this form to reserve a table
                  </p>
                </div>
                <div className="grid gap-4">
                  <div className="flex flex-col md:flex-row justify-center items-center gap-2">
                    <div className="grid gap-2 w-full">
                      <Label htmlFor="reservationDate">reservationDate</Label>
                      <Input
                        id="reservationDate"
                        name="reservationDate"
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        required
                        defaultValue={
                          toDateTime(reservation.reservationDate).date
                        }
                      />
                    </div>
                    <div className="grid gap-2 w-full">
                      <Label htmlFor="reservationTime">reservationTime</Label>
                      <Input
                        id="reservationTime"
                        name="reservationTime"
                        type="time"
                        min="08:00"
                        max="20:00"
                        required
                        onChange={(e) => {
                          const inputTime = e.target.value;
                          if (inputTime < "08:00") {
                            e.target.value = "08:00";
                          } else if (inputTime > "20:00") {
                            e.target.value = "20:00";
                          }
                        }}
                        defaultValue={
                          toDateTime(reservation.reservationDate).time
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="partySize">Party Size</Label>
                    <Select
                      name="partySize"
                      defaultValue={reservation.partySize.toString()}
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select for how many people" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="2">2 Guests</SelectItem>
                          <SelectItem value="6">6 People</SelectItem>
                          <SelectItem value="10">10 People</SelectItem>
                          <SelectItem value="20">20 People</SelectItem>
                          <SelectItem value="30">30 People</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="seatingPreference">
                      Seating Preference
                    </Label>
                    <Select
                      name="seatingPreference"
                      defaultValue={reservation.seatingPreference}
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Place at Outdoor or Indoor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="outdoor">Outdoor</SelectItem>
                          <SelectItem value="indoor">Indoor</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="specialRequest">Special Request</Label>
                    <Textarea
                      className="min-h-[100px]"
                      id="specialRequest"
                      name="specialRequest"
                      defaultValue={reservation.specialRequest}
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center gap-2 mt-6">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsFormOpen("")}
                  >
                    Discard
                  </Button>
                  <AlertDialogComponent isFormOpen={isFormOpen} />
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function CancelReservationComponent({
  isFormOpen,
  setIsFormOpen,
}: {
  isFormOpen: "update" | "cancel" | "pending" | "";
  setIsFormOpen: Dispatch<SetStateAction<"update" | "cancel" | "pending" | "">>;
}) {
  const { token, id } = useParams<{ token: string; id: string }>();
  const useCancelReservation = cancelReservationAction.bind(null, {
    isMember: false,
    token,
    reservationId: id,
  });
  const [state, action] = useFormState(useCancelReservation, {});
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.back();
    }
  }, [router, state.success]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-start gap-3 items-center">
            Cancel Reservation
            <BookX />
          </CardTitle>
          <CardDescription>
            Lipsum dolor sit amet, consectetur adipiscing elit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsFormOpen("cancel")}
            >
              Cancel Reservation
            </Button>
          </div>

          {isFormOpen === "cancel" && (
            <form id="cancel" action={action}>
              <div className="my-6">
                <h1 className="text-sm font-bold text-center md:text-start">
                  Cancel Yout Reservation
                </h1>
                <p className="text-muted-foreground text-sm text-center md:text-start">
                  Please fill out this form to cancelling reserve
                </p>
              </div>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="reasonCancellation">
                    Reason of Cancellation
                  </Label>
                  <Textarea
                    className="min-h-[100px]"
                    id="reasonCancellation"
                    name="reasonCancellation"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-between items-center gap-2 mt-6">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsFormOpen("")}
                >
                  Discard
                </Button>
                <AlertDialogComponent isFormOpen={isFormOpen} />
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function PendingReservationComponent({
  isFormOpen,
  setIsFormOpen,
}: {
  isFormOpen: "update" | "cancel" | "pending" | "";
  setIsFormOpen: Dispatch<SetStateAction<"update" | "cancel" | "pending" | "">>;
}) {
  const { token, id } = useParams<{ token: string; id: string }>();
  const useCancelReservation = pendingReservationAction.bind(null, {
    isMember: false,
    token,
    reservationId: id,
  });
  const [state, action] = useFormState(useCancelReservation, {});
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.back();
    }
  }, [router, state.success]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-start gap-3 items-center">
            Pending Reservation
            <TimerReset />
          </CardTitle>
          <CardDescription>
            Lipsum dolor sit amet, consectetur adipiscing elit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsFormOpen("pending")}
            >
              Pending Reservation
            </Button>
          </div>

          {isFormOpen === "pending" && (
            <form id="pending" action={action}>
              <div className="my-6">
                <h1 className="text-sm font-bold text-center md:text-start">
                  Pending Yout Reservation
                </h1>
                <p className="text-muted-foreground text-sm text-center md:text-start">
                  Please fill out this form to pending reserve
                </p>
              </div>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="reasonPending">Reason of Pending</Label>
                  <Textarea
                    className="min-h-[100px]"
                    id="reasonPending"
                    name="reasonPending"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-between items-center gap-2 mt-6">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsFormOpen("")}
                >
                  Discard
                </Button>
                <AlertDialogComponent isFormOpen={isFormOpen} />
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function AlertDialogComponent({
  isFormOpen,
}: {
  isFormOpen: "update" | "cancel" | "pending" | "";
}) {
  const capitalized = isFormOpen
    .split("")
    .map((x, i) => (i === 0 ? x.toUpperCase() : x))
    .join("");

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant={isFormOpen === "update" ? "default" : "destructive"}
          className="w-full"
        >
          {capitalized} Reservation
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel type="button">Close</AlertDialogCancel>
          <AlertDialogAction type="submit" form={isFormOpen}>
            Yes, I&apos;ll {capitalized} My Reservation
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function InviteFriendsButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="flex gap-2">
          <span className="sr-only sm:not-sr-only">Invite</span>
          <SquareArrowOutUpRight className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share link</DialogTitle>
          <DialogDescription>
            It will creat invitation page and then invite your friend to join
            your agenda. Anyone who has this link will be able to view this.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input
              id="link"
              defaultValue="http://localhost:3000/invitation"
              readOnly
            />
          </div>
          <Button type="submit" size="sm" className="px-3">
            <span className="sr-only">Copy</span>
            <CopyIcon className="h-4 w-4" />
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
