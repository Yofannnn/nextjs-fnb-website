export function formatDate(
  isoDate: Date | string,
  type: "long" | "short" | "numeric",
  separator: "-" | "/" = "/"
): string {
  const date = new Date(isoDate);

  switch (type) {
    case "short":
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    case "long":
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    case "numeric":
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = String(date.getFullYear());
      return [day, month, year].join(separator);
    default:
      throw new Error("Invalid format type");
  }
}

export function toISODate(dateInput: string, timeInput: string): string {
  if (!dateInput || !timeInput) {
    throw new Error("Both dateInput and timeInput are required.");
  }
  const [year, month, day] = dateInput.split("-");
  const [hour, minute] = timeInput.split(":");

  if (
    !year ||
    !month ||
    !day ||
    !hour ||
    !minute ||
    isNaN(+year) ||
    isNaN(+month) ||
    isNaN(+day) ||
    isNaN(+hour) ||
    isNaN(+minute)
  ) {
    throw new Error("Invalid date or time input.");
  }

  const dateTime = new Date(Date.UTC(+year, +month - 1, +day, +hour, +minute));
  return dateTime.toISOString();
}

export function toDateTime(isoString: string | Date): {
  date: string;
  time: string;
} {
  const dateTime = new Date(isoString);
  const date = dateTime.toISOString().split("T")[0];
  const time = dateTime.toISOString().split("T")[1].slice(0, 5);
  return { date, time };
}
