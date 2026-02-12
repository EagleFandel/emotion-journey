export function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTimezoneOffsetMinutes(): number {
  return new Date().getTimezoneOffset();
}

export function toLocalDateTimeInput(isoDateTime: string): string {
  return isoDateTime.slice(0, 16);
}

export function fromLocalDateTimeInput(localDateTime: string): string {
  const date = new Date(localDateTime);
  return date.toISOString();
}

export function formatDateLabel(date: string): string {
  const target = new Date(date);
  return target.toLocaleDateString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
}
