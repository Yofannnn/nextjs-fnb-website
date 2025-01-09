"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalBody, ModalContent, ModalFooter, ModalProvider } from "@/components/ui/animated-modal";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MinusIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { clearClientReservationDetails, saveClientReservationDetails } from "@/redux/slice/reservation.slice";
import { User } from "@/types/user.type";
import { Product } from "@/types/product.type";
import { TransactionSuccess } from "@/types/transaction.type";
import { InitializeReservationPayload } from "@/types/order.type";
import { confirmReservationAction, initializeReservationAction } from "@/actions/reservation.action";
import { rupiah } from "@/lib/format-currency";

export default function ReservationPage({ isAuth, user }: { isAuth: boolean; user: Omit<User, "password"> | undefined }) {
  const { toast } = useToast();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const clientReservationDetails = useSelector((state: RootState) => state.clientReservationData);
  const [isSubmitting, setSubmitStatus] = useState(false);

  const {
    customerEmail,
    customerName,
    reservationDate,
    reservationTime,
    partySize,
    seatingPreference,
    specialRequest,
    menus,
    reservationType,
    paymentStatus,
  } = clientReservationDetails;

  const subtotal: number = menus.reduce((acc, menu) => acc + menu.price * menu.quantity, 0);
  const discount: number = !isAuth || reservationType === "table-only" ? 0 : (subtotal * 10) / 100;
  const total: number = subtotal - discount;
  const downPayment: number = reservationType === "table-only" ? 30000 : paymentStatus === "downPayment" ? total / 2 : total;

  /**
   * Handles the booking process, including payment and confirmation.
   * @param {React.FormEvent<HTMLFormElement>} e - The form event.
   */
  const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSubmitStatus(true);

    if (isSubmitting) return;

    /**
     * The payload for the initializeReservationAction function.
     * This payload will be used to create a new reservation.
     */
    const body: InitializeReservationPayload = {
      customerName: user?.name || customerName,
      customerEmail: user?.email || customerEmail,
      reservationDate: new Date(`${reservationDate}T${reservationTime}`),
      partySize,
      seatingPreference: seatingPreference as "indoor" | "outdoor",
      specialRequest,
      paymentStatus,
      menus:
        reservationType === "table-only"
          ? []
          : menus.map((menu) => ({
              productId: menu.productId,
              quantity: menu.quantity,
              price: menu.price,
            })),
    };

    try {
      const action = await initializeReservationAction(body);
      const token = action.data;

      window.snap.pay(token, {
        onSuccess: async function (result: TransactionSuccess) {
          toast({
            title: "Booking Success",
            description: "Thank you for booking with us",
          });

          await confirmReservationAction(result.order_id);

          router.push(isAuth ? `/dashboard/reservation/${result.order_id}` : `/guest/reservation/${result.order_id}`);
        },
        onPending: function (result: any) {
          router.push(isAuth ? `/dashboard/transaction` : `/guest/transaction`);
        },
        onError: function (result: any) {
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: result,
          });
        },
        onClose: function () {
          router.push(isAuth ? `/dashboard/transaction` : `/guest/transaction`);
        },
      });

      dispatch(clearClientReservationDetails());
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message,
      });
    } finally {
      setSubmitStatus(false);
    }
  };

  return (
    <div className="mx-auto grid gap-3 md:grid-cols-[1fr_250px] lg:grid-cols-5 lg:gap-5 pt-20 px-2 md:px-4 py-8">
      <div className="lg:col-span-3">
        <Card>
          <CardHeader />
          <CardContent>
            <Label htmlFor="reservationType">Reservation Type</Label>
            <Select
              name="reservationType"
              defaultValue={reservationType}
              onValueChange={(e) =>
                dispatch(
                  saveClientReservationDetails({
                    ...clientReservationDetails,
                    reservationType: e as "table-only" | "include-food",
                  })
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="table-only">Table Only</SelectItem>
                  <SelectItem value="include-food">Include Food</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {reservationType === "include-food" && (
              <>
                <ModalMenu />
                <MenusForReservationComponent />
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Reservation</CardTitle>
            <CardDescription>Please fill out this form to reserve a table</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBooking}>
              <div className="grid gap-4">
                {!isAuth && (
                  <>
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor="customerEmail">Email</Label>
                        <Link href="/register?redirect=reservation" className="ml-auto inline-block text-sm underline">
                          Create Member Pass?
                        </Link>
                      </div>
                      <Input
                        id="customerEmail"
                        name="customerEmail"
                        type="email"
                        placeholder="m@example.com"
                        required
                        value={customerEmail}
                        onChange={(e) => {
                          dispatch(
                            saveClientReservationDetails({
                              ...clientReservationDetails,
                              customerEmail: e.target.value,
                            })
                          );
                        }}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="customerName">Name</Label>
                      <Input
                        id="customerName"
                        name="customerName"
                        type="text"
                        placeholder="Max Verstappen"
                        required
                        value={customerName}
                        onChange={(e) => {
                          dispatch(
                            saveClientReservationDetails({
                              ...clientReservationDetails,
                              customerName: e.target.value,
                            })
                          );
                        }}
                      />
                    </div>
                  </>
                )}
                <div className="flex flex-col md:flex-row justify-center items-center gap-2">
                  <div className="grid gap-2 w-full">
                    <Label htmlFor="reservationDate">Reservation Date</Label>
                    <Input
                      id="reservationDate"
                      name="reservationDate"
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      required
                      value={reservationDate}
                      onChange={(e) => {
                        dispatch(
                          saveClientReservationDetails({
                            ...clientReservationDetails,
                            reservationDate: e.target.value,
                          })
                        );
                      }}
                    />
                  </div>
                  <div className="grid gap-2 w-full">
                    <Label htmlFor="reservationTime">Reservation Time</Label>
                    <Input
                      id="reservationTime"
                      name="reservationTime"
                      type="time"
                      min="08:00"
                      max="20:00"
                      required
                      value={reservationTime}
                      onChange={(e) => {
                        const inputTime = e.target.value;
                        if (inputTime < "08:00") {
                          e.target.value = "08:00";
                        } else if (inputTime > "20:00") {
                          e.target.value = "20:00";
                        }
                        dispatch(
                          saveClientReservationDetails({
                            ...clientReservationDetails,
                            reservationTime: e.target.value,
                          })
                        );
                      }}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="partySize">Party Size</Label>
                  <Select
                    name="partySize"
                    required
                    defaultValue={String(partySize)}
                    onValueChange={(e) =>
                      dispatch(
                        saveClientReservationDetails({
                          ...clientReservationDetails,
                          partySize: Number(e),
                        })
                      )
                    }
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
                  <Label htmlFor="seatingPreference">Seating Preference</Label>
                  <Select
                    name="seatingPreference"
                    required
                    defaultValue={seatingPreference}
                    onValueChange={(e) =>
                      dispatch(
                        saveClientReservationDetails({
                          ...clientReservationDetails,
                          seatingPreference: e as "outdoor" | "indoor",
                        })
                      )
                    }
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
                    value={specialRequest}
                    onChange={(e) => {
                      dispatch(
                        saveClientReservationDetails({
                          ...clientReservationDetails,
                          specialRequest: e.target.value,
                        })
                      );
                    }}
                  />
                </div>
                {reservationType === "include-food" && (
                  <div className="grid gap-2">
                    <Label htmlFor="paymentStatus">Payment Status</Label>
                    <Select
                      name="paymentStatus"
                      required
                      defaultValue={paymentStatus}
                      onValueChange={(e) => {
                        dispatch(
                          saveClientReservationDetails({
                            ...clientReservationDetails,
                            paymentStatus: e as "downPayment" | "paid",
                          })
                        );
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Wanna full payment or down payment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="downPayment">Down Payment</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label>Bill</Label>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{rupiah.format(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span>- {rupiah.format(discount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span>{rupiah.format(total)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Bill {paymentStatus === "downPayment" && "(Down Payment)"}</span>
                    <span>{rupiah.format(downPayment)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="animate-spin size-4 mr-2" />}
                  Reserve Now
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MenusForReservationComponent() {
  const dispatch: AppDispatch = useDispatch();
  const clientReservationData = useSelector((state: RootState) => state.clientReservationData);
  const { menus } = clientReservationData;

  /**
   * Adjust the quantity of the product.
   *
   * This function will increase or decrease the quantity of the product based
   * on the `increase` parameter. If `increase` is true, the quantity will be
   * increased by 1. If `increase` is false, the quantity will be decreased by 1.
   *
   * @param product The product to be adjusted.
   * @param increase A boolean indicating whether to increase or decrease the
   * quantity.
   */
  const adjustProductQuantity = (product: Product, increase: boolean) => {
    let updatedMenus;
    let updatedClientReservationData;

    if (increase) {
      updatedMenus = [...menus].map((menu) =>
        menu.productId === product.productId ? { ...menu, quantity: menu.quantity + 1 } : menu
      );
      updatedClientReservationData = {
        ...clientReservationData,
        menus: updatedMenus,
      };
    } else {
      updatedMenus = [...menus].map((menu) =>
        menu.productId === product.productId ? { ...menu, quantity: menu.quantity - 1 } : menu
      );
      updatedClientReservationData = {
        ...clientReservationData,
        menus: updatedMenus,
      };
    }

    dispatch(saveClientReservationDetails(updatedClientReservationData));
  };

  /**
   * Remove a product from the menu.
   *
   * This function will remove the product from the menu based on the `productId`
   * parameter.
   *
   * @param productId The ID of the product to be removed.
   */
  const removeProduct = (productId: string) => {
    let updatedMenus;
    updatedMenus = [...menus].filter((menu) => menu.productId !== productId);
    const updatedClientReservationData = {
      ...clientReservationData,
      menus: updatedMenus,
    };
    dispatch(saveClientReservationDetails(updatedClientReservationData));
  };

  return (
    <div>
      {menus?.length === 0 || !menus ? (
        <div className="text-center mt-4 text-xl font-semibold">No Menu</div>
      ) : (
        menus.map((item, i) => (
          <div key={i} className="flex outline-1 outline-white px-0 md:px-3 py-8 rounded-2xl mb-2 relative">
            <span className="w-full h-px absolute left-0 -bottom-1 bg-muted-foreground" />
            <div className="max-w-[min-content]">
              <Image
                className="w-full object-cover aspect-square pointer-events-none"
                src={item.image}
                width={200}
                height={200}
                alt={item.title}
                priority
              />
              <div className="flex items-center border border-foreground overflow-hidden rounded-full gap-2 mt-6">
                <Button
                  className="rounded-full p-2 md:p-4"
                  variant="ghost"
                  onClick={() => adjustProductQuantity(item, false)}
                  disabled={item.quantity === 1}
                >
                  <MinusIcon className="size-3 md:size-4" />
                </Button>
                <h6 className="text-sm md:text-base">{item.quantity}</h6>
                <Button
                  className="rounded-full p-2 md:p-4"
                  variant="ghost"
                  onClick={() => adjustProductQuantity(item, true)}
                >
                  <PlusIcon className="size-3 md:size-4" />
                </Button>
              </div>
            </div>
            <div className="w-full pl-4">
              <h2 className="text-base md:text-lg font-medium">{item.title}</h2>
              <h6 className="text-sm md:text-base text-muted-foreground">{item.category}</h6>
              <h6 className="text-sm md:text-base mt-2">{rupiah.format(item.price)}</h6>
            </div>
            <div className="relative">
              <h6 className="text-sm md:text-base absolute top-0 right-0">
                {rupiah.format(item.price * (item.quantity || 0))}
              </h6>
              <Button
                className="absolute bottom-0 right-0 rounded-full p-3"
                variant="ghost"
                onClick={() => removeProduct(item.productId)}
              >
                <Trash2Icon className="size-4" />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

const ModalMenu = () => {
  const dispatch: AppDispatch = useDispatch();
  const clientReservationData = useSelector((state: RootState) => state.clientReservationData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menus, setMenus] = useState<{
    loading: boolean;
    status: "success" | "failed" | "";
    data: Product[];
    error: string;
  }>({
    loading: true,
    status: "",
    data: [],
    error: "",
  });

  useEffect(() => {
    async function getMenus() {
      try {
        const res = await fetch("/api/products", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.statusText);
        setMenus({
          loading: false,
          status: "success",
          data: result.data,
          error: "",
        });
      } catch (error: any) {
        setMenus({
          loading: false,
          status: "failed",
          data: [],
          error: error.message,
        });
      }
    }

    if (isModalOpen) getMenus();
  }, [isModalOpen]);

  const handleAddItem = (product: Product) => {
    const { menus } = clientReservationData;
    const findIndexProduct = menus?.findIndex((item) => item.productId === product.productId);

    let updatedMenus;
    if (findIndexProduct !== -1) {
      updatedMenus = [...menus].map((item, i) => (findIndexProduct === i ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      updatedMenus = [...menus, { ...product, quantity: 1 }];
    }

    const updatedClientReservationData = {
      ...clientReservationData,
      menus: updatedMenus,
    };
    dispatch(saveClientReservationDetails(updatedClientReservationData));
  };

  return (
    <>
      <Button className="w-full my-4" onClick={() => setIsModalOpen(true)}>
        Open Menu
      </Button>
      <ModalProvider open={isModalOpen} setOpen={setIsModalOpen}>
        <ModalBody className="max-h-[90svh]">
          <ModalContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-2 p-2 md:p-3 overflow-x-hidden overflow-y-auto">
            {menus.loading ? (
              <div className="col-span-full min-h-[50svh] py-6 flex justify-center items-center text-3xl">
                <h1>Loading....</h1>
              </div>
            ) : menus.status === "failed" ? (
              <div className="col-span-full min-h-[50svh] py-6 flex justify-center items-center text-3xl">
                <div>
                  <span className="text-destructive">Error: </span>
                  {menus.error}
                </div>
              </div>
            ) : (
              menus.data.map((menu, i) => (
                <Card key={i} className="relative col-span-1 p-3 rounded-[30px]">
                  <div className="rounded-[21px] overflow-hidden">
                    <Image
                      src={menu.image}
                      width={100}
                      height={100}
                      alt="menu-image"
                      className="w-full h-[230px] lg:h-[300px] object-cover object-center"
                    />
                  </div>
                  <h6 className="text-lg md:text-xl font-medium mt-7">{menu.title}</h6>
                  <p className="text-muted-foreground mt-1 text-xs md:text-sm">{menu.category}</p>
                  <p className="text-sm md:text-base mt-2 mb-4">{rupiah.format(menu.price)}</p>
                  <Button
                    className="mb-4 w-full md:mb-0 md:w-fit md:absolute md:bottom-4 md:right-4 rounded-full"
                    onClick={() => handleAddItem(menu)}
                  >
                    Select
                  </Button>
                </Card>
              ))
            )}
          </ModalContent>
          <ModalFooter>
            <Button onClick={() => setIsModalOpen(false)}>Close</Button>
          </ModalFooter>
        </ModalBody>
      </ModalProvider>
    </>
  );
};
