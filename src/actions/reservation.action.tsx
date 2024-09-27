import { toISODate } from "@/lib/format-date";
import { formatError } from "@/lib/format-error";
import { ActionResult } from "@/types/action-result.type";
import { ReservationSchema } from "@/validations/reservation.validation";

export async function reservationTableOnlyAction(
  authUserEmail: string | undefined,
  authUserName: string | undefined,
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const dateInput = formData.get("reservationDate") as string;
  const timeInput = formData.get("reservationTime") as string;
  const data = {
    customerName: authUserName || formData.get("customerName"),
    customerEmail: authUserEmail || formData.get("customerEmail"),
    reservationDate:
      dateInput && timeInput ? toISODate(dateInput, timeInput) : null,
    partySize: Number(formData.get("partySize")),
    seatingPreference: formData.get("seatingPreference"),
    specialRequest: formData.get("specialRequest"),
    tableOnly: true,
    downPayment: 20000,
    total: 20000,
    paymentStatus: "paid",
  };

  const validatedFields = await ReservationSchema.safeParseAsync(data);

  if (!validatedFields.success)
    return { success: false, errors: formatError(validatedFields.error) };

  try {
    const res = await fetch(
      `/api/reservation/${authUserEmail ? "member" : "guest"}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedFields.data),
      }
    );
    if (!res.ok) throw new Error(res.statusText);
    const resData = await res.json();
    return resData.link
      ? { success: true, data: { link: `/manage-reservation/${resData.link}` } }
      : { success: true, data: { link: `/dashboard/user/reservation` } };
  } catch (error: any) {
    return { success: false, errors: formatError(error.message) };
  }
}

interface BookedMenus {
  productId: string;
  quantity: number;
}

export async function reservationIncludesDishAction(
  authUserEmail: string | undefined,
  authUserName: string | undefined,
  bookedMenus: BookedMenus[],
  downPayment: number,
  total: number,
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const dateInput = formData.get("reservationDate") as string;
  const timeInput = formData.get("reservationTime") as string;
  const data = {
    customerName: authUserName || formData.get("customerName"),
    customerEmail: authUserEmail || formData.get("customerEmail"),
    reservationDate:
      dateInput && timeInput ? toISODate(dateInput, timeInput) : null,
    partySize: Number(formData.get("partySize")),
    seatingPreference: formData.get("seatingPreference"),
    specialRequest: formData.get("specialRequest"),
    tableOnly: true,
    menus: bookedMenus,
    downPayment,
    total,
    paymentStatus: "downPayment",
  };

  const validatedFields = await ReservationSchema.safeParseAsync(data);

  if (!validatedFields.success)
    return { success: false, errors: formatError(validatedFields.error) };

  try {
    const res = await fetch(
      `/api/reservation/${authUserEmail ? "member" : "guest"}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedFields.data),
      }
    );
    if (!res.ok) throw new Error(res.statusText);
    const resData = await res.json();
    return resData.link
      ? { success: true, data: { link: `/manage-reservation/${resData.link}` } }
      : { success: true, data: { link: `/dashboard/user/reservation` } };
  } catch (error: any) {
    return { success: false, errors: error.message };
  }
}

export async function updateReservationTableOnlyAction(
  token: string,
  reservationId: string,
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const rawFormData = Object.fromEntries(formData.entries());

  try {
    const res = await fetch(
      `/api/reservation/guest?token=${token}&id=${reservationId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rawFormData),
      }
    );
    if (!res.ok) throw new Error(res.statusText);
    return { success: true };
  } catch (error: any) {
    return { success: false, errors: formatError(error.message) };
  }
}

// actually its just for guest
export async function cancelReservationAction( //===== guest =====
  token: string,
  reservationId: string,
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const res = await fetch(
      `/api/reservation/guest?token=${token}&id=${reservationId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationStatus: "cancelled",
          reasonCancellation: formData.get("reasonCancellation"),
        }),
      }
    );
    if (!res.ok) throw new Error(res.statusText);
    return { success: true };
  } catch (error: any) {
    return { success: false, errors: formatError(error.message) };
  }
}

// actually its just for guest
export async function pendingReservationAction( //=== guest ====
  token: string,
  reservationId: string,
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  console.log("reason pending : ", formData.get("reasonPending"));

  try {
    const res = await fetch(
      `/api/reservation/guest?token=${token}&id=${reservationId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationStatus: "pending",
          reasonCancellation: formData.get("reasonCancellation"),
        }),
      }
    );
    if (!res.ok) throw new Error(res.statusText);
    return { success: true };
  } catch (error: any) {
    return { success: false, errors: formatError(error.message) };
  }
}
