export function formatDate(
  isoDate: Date | string,
  type: "long" | "short" | "numeric" = "short",
  separator: "-" | "/" = "/"
): string {
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) throw new Error("Invalid date provided");

  switch (type) {
    case "short":
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
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

export function formatTime(isoDate: Date | string): string {
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) throw new Error("Invalid date provided");

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function getDateAndTime(isoString: string | Date): {
  date: string;
  time: string;
} {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) throw new Error("Invalid date provided");

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return {
    date: formattedDate, // YYYY-MM-DD
    time: `${hours}:${minutes}`, // HH:mm
  };
}
