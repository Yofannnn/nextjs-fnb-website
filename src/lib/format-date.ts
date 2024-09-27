export function formatDate(
  isoDate: Date,
  type: "formatDateLong" | "formatDateNumeric",
  separator: "-" | "/" = "/"
): string {
  const date = new Date(isoDate);

  if (type === "formatDateLong") {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());

  return [day, month, year].join(separator);
}

export function toISODate(dateInput: string, timeInput: string): string {
  const combinedDateTime = `${dateInput}T${timeInput}`;
  const dateTime = new Date(combinedDateTime);
  return dateTime.toISOString();
}

export function toDateTime(isoString: string) {
  const dateTime = new Date(isoString);
  const date = dateTime.toISOString().split("T")[0];
  const time = dateTime.toTimeString().slice(0, 5);
  return { date, time };
}
