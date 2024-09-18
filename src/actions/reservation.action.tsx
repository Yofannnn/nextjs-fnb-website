import { ActionResult } from "@/types/action-result.type";

export async function reservationTableOnlyAction(
  email: string | undefined,
  name: string | undefined,
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const data = {
    customerName: name || formData.get("name"),
    customerEmail: email || formData.get("email"),
    reservationDate: formData.get("date"),
    reservationTime: formData.get("time"),
    partySize: formData.get("partySize"),
    seatingPreference: formData.get("seatingPreference"),
    specialRequest: formData.get("specialRequest"),
    tableOnly: true,
  };

  try {
    const res = await fetch("/api/reservation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    console.log(res);
    if (!res.ok) throw new Error(res.statusText);
    return { success: true };
  } catch (error: any) {
    return { success: false, errors: error.message };
  }
}
