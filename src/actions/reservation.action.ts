import { toISODate } from "@/lib/format-date";
import { formatError } from "@/lib/format-error";
import { ActionResult } from "@/types/action-result.type";
import { ReservationSchema } from "@/validations/reservation.validation";

export async function createReservationTableOnlyAction(
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
      : { success: true, data: { link: `/dashboard/reservation` } };
  } catch (error: any) {
    return { success: false, errors: formatError(error.message) };
  }
}

interface BookedMenus {
  productId: string;
  quantity: number;
}

export async function createReservationIncludesDishAction(
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
      : { success: true, data: { link: `/dashboard/reservation` } };
  } catch (error: any) {
    return { success: false, errors: error.message };
  }
}

export async function updateReservationAction(
  {
    isMember,
    userId,
    token,
    reservationId,
    bookedMenus,
  }: {
    isMember: boolean;
    userId?: string | undefined;
    token?: string | undefined;
    reservationId: string;
    bookedMenus?: BookedMenus[] | undefined;
  },
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const dateInput = formData.get("reservationDate") as string;
  const timeInput = formData.get("reservationTime") as string;
  const reservationDate = toISODate(dateInput, timeInput);
  const dataBody = {
    reservationDate,
    partySize: Number(formData.get("partySize")),
    seatingPreference: formData.get("seatingPreference"),
    specialRequest: formData.get("specialRequest"),
    menus: bookedMenus || [],
  };

  const endpoint = `/api/reservation/${isMember ? "member" : "guest"}?${
    isMember ? "memberId" : "token"
  }=${isMember ? userId : token}&reservationId=${reservationId}`;

  try {
    const res = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataBody),
    });
    if (!res.ok) throw new Error(res.statusText);
    return { success: true };
  } catch (error: any) {
    return { success: false, errors: error.message };
  }
}

export async function cancelReservationAction(
  {
    isMember,
    userId,
    token,
    reservationId,
  }: {
    isMember: boolean;
    userId?: string | undefined;
    token?: string | undefined;
    reservationId: string;
  },
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const endpoint = `/api/reservation/${isMember ? "member" : "guest"}?${
    isMember ? "memberId" : "token"
  }=${isMember ? userId : token}&reservationId=${reservationId}`;

  try {
    const res = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reservationStatus: "cancelled",
        reasonCancellation: formData.get("reasonCancellation"),
      }),
    });
    if (!res.ok) throw new Error(res.statusText);
    return { success: true };
  } catch (error: any) {
    return { success: false, errors: formatError(error.message) };
  }
}

export async function pendingReservationAction(
  {
    isMember,
    userId,
    token,
    reservationId,
  }: {
    isMember: boolean;
    userId?: string | undefined;
    token?: string | undefined;
    reservationId: string;
  },
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const endpoint = `/api/reservation/${isMember ? "member" : "guest"}?${
    isMember ? "memberId" : "token"
  }=${isMember ? userId : token}&reservationId=${reservationId}`;

  try {
    const res = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reservationStatus: "pending",
        reasonCancellation: formData.get("reasonCancellation"),
      }),
    });
    if (!res.ok) throw new Error(res.statusText);
    return { success: true };
  } catch (error: any) {
    return { success: false, errors: formatError(error.message) };
  }
}
