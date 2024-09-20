import { formatError } from "@/lib/format-error";
import { ActionResult } from "@/types/action-result.type";

export async function reservationTableOnlyAction(
  authUserEmail: string | undefined,
  authUserName: string | undefined,
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const data = {
    customerName: authUserName || formData.get("customerName"),
    customerEmail: authUserEmail || formData.get("customerEmail"),
    reservationDate: formData.get("reservationDate"),
    reservationTime: formData.get("reservationTime"),
    partySize: formData.get("partySize"),
    seatingPreference: formData.get("seatingPreference"),
    specialRequest: formData.get("specialRequest"),
    tableOnly: true,
  };

  try {
    const res = await fetch(
      `/api/reservation/${authUserEmail ? "member" : "guest"}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );
    if (!res.ok) throw new Error(res.statusText);
    const resData = await res.json();
    console.log(resData);
    if (resData.link) return { success: true, data: resData.link };
    return { success: true };
  } catch (error: any) {
    return { success: false, errors: formatError(error.message) };
  }
}
