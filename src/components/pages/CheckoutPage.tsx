"use client"

import { Button } from "@/components/ui/button"
import { AppDispatch, RootState } from "@/redux/store"
import { User } from "@/types/user.type"
import { useDispatch, useSelector } from "react-redux"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { TransactionSuccess } from "@/types/transaction.type"
import { Textarea } from "@/components/ui/textarea"
import { handleTransactionComplete } from "@/midtrans/init"
import Image from "next/image"
import { rupiah } from "@/lib/format-currency"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { clearCheckoutData, saveCheckoutData } from "@/redux/slice/checkout.slice"

export default function CheckoutPage({ isAuth, user }: { isAuth: boolean; user: Omit<User, "password"> | undefined }) {
  const { toast } = useToast()
  const router = useRouter()
  const dispatch: AppDispatch = useDispatch()
  const localCheckoutData = useSelector((state: RootState) => state.clientCheckoutData)

  const { customerName, customerEmail, customerAddress, deliveryDate, note, productsCheckout } = localCheckoutData

  function getSubtotal(): number {
    return productsCheckout.length === 0
      ? 0
      : productsCheckout.map((item) => item.price * item.quantity).reduce((acc, cur) => acc + cur, 0)
  }

  function getDiscount(): number {
    const discount = 10 // 10 percent
    return !isAuth ? 0 : (getSubtotal() * discount) / 100
  }

  async function handleCheckout(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const form = new FormData(e.currentTarget)
    const body = {
      customerName: isAuth ? user?.name : form.get("customerName"),
      customerEmail: isAuth ? user?.email : form.get("customerEmail"),
      customerAddress: isAuth ? user?.address : form.get("customerAddress"),
      deliveryDate: form.get("deliveryDate"),
      items: productsCheckout.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
      })),
      note: form.get("note") || undefined,
    }

    try {
      const response = await fetch(`/api/online-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.statusText)
      const { transactionId, guestAccessToken } = result.data

      window.snap.pay(transactionId, {
        onSuccess: async function (result: TransactionSuccess) {
          toast({
            title: "Order Success",
            description: "Thank you for ordering with us",
          })
          await handleTransactionComplete(user?._id || guestAccessToken, result.order_id, "online-order")
          router.push(
            isAuth
              ? `/dashboard/online-order/${result.order_id}`
              : `/guest/online-order/${guestAccessToken}/${result.order_id}`
          )
          // dispatch(clearCheckoutData());
        },
        onPending: function (result: any) {
          router.push(isAuth ? `/dashboard/transaction` : `/guest/transaction/${guestAccessToken}`)
        },
        onError: function (result: any) {
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: result,
          })
        },
        onClose: function () {
          router.push(isAuth ? `/dashboard/transaction` : `/guest/transaction/${guestAccessToken}`)

          dispatch(clearCheckoutData())
        },
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message,
      })
    }
  }

  if (!productsCheckout.length) return <div>Cart is empty please select item to checkout</div>

  return (
    <div className="w-full pt-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2 sm:px-6 md:px-8">
        <div className="order-2 md:order-1 col-span-1 px-2 mb-6 md:mb-0">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Billing Information</h2>
          <div>
            <form onSubmit={handleCheckout}>
              <div className="grid gap-4">
                {!isAuth && (
                  <>
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor="email">Email</Label>
                        <Link href="/login?redirect=checkout" className="ml-auto inline-block text-sm underline">
                          Already have account?
                        </Link>
                      </div>
                      <Input
                        id="email"
                        type="email"
                        name="customerEmail"
                        placeholder="example@gmail.com"
                        required
                        value={customerEmail}
                        onChange={(e) =>
                          dispatch(
                            saveCheckoutData({
                              ...localCheckoutData,
                              customerEmail: e.target.value,
                            })
                          )
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        type="text"
                        name="customerName"
                        placeholder="max verstappen"
                        required
                        value={customerName}
                        onChange={(e) =>
                          dispatch(
                            saveCheckoutData({
                              ...localCheckoutData,
                              customerName: e.target.value,
                            })
                          )
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        type="text"
                        name="customerAddress"
                        placeholder="Enter your current address"
                        required
                        value={customerAddress}
                        onChange={(e) =>
                          dispatch(
                            saveCheckoutData({
                              ...localCheckoutData,
                              customerAddress: e.target.value,
                            })
                          )
                        }
                      />
                    </div>
                  </>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="deliveryDate">Delivery Date</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    name="deliveryDate"
                    required
                    value={deliveryDate}
                    onChange={(e) =>
                      dispatch(
                        saveCheckoutData({
                          ...localCheckoutData,
                          deliveryDate: e.target.value,
                        })
                      )
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="note">Note</Label>
                  <Textarea
                    id="note"
                    name="note"
                    placeholder="Type your message here."
                    className="min-h-[120px]"
                    value={note}
                    onChange={(e) =>
                      dispatch(
                        saveCheckoutData({
                          ...localCheckoutData,
                          note: e.target.value,
                        })
                      )
                    }
                  />
                </div>
              </div>
              <Button type="submit" className="w-full mt-8">
                Checkout now
              </Button>
            </form>
          </div>
        </div>
        <div className="col-span-1 px-2 mb-6 order-1 md:order-2">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Order Summary</h2>
          <div>
            {productsCheckout.map((product, i) => (
              <div key={i} className="flex gap-4 py-2">
                <div className="w-[30%] md:w-fit">
                  <Image
                    src={product.image}
                    alt={product.title}
                    width={100}
                    height={100}
                    className="w-full object-cover aspect-square pointer-events-none"
                  />
                </div>
                <div>
                  <h4 className="font-medium text-base md:text-xl">{product.title}</h4>
                  <h6 className="text-muted-foreground text-sm md:text-base">{product.category}</h6>
                  <h6 className="text-sm md:text-base">{rupiah.format(product.price)}</h6>
                  <div className="flex justify-between items-center text-sm md:text-base mt-2">
                    <span>Qty: {product.quantity}</span>
                    <span>{rupiah.format(product.price * product.quantity)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Separator className="w-full bg-muted-foreground my-4" />
          <div className="grid gap-1 text-sm md:text-base">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Subtotal</span>
              <span>{rupiah.format(getSubtotal())}</span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Discount</span>
              <span>- {rupiah.format(getDiscount())}</span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Delivery/Shipping</span>
              <span>+ {rupiah.format(0)}</span>
            </div>
            <div className="flex justify-between items-center font-medium">
              <span>Total</span>
              <span>{rupiah.format(getSubtotal() - getDiscount()) + 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
