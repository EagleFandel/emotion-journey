export function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
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
