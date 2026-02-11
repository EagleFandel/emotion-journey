import { clsx } from "clsx";

export function cn(...inputs: Array<string | number | false | null | undefined>) {
  return clsx(inputs);
}

export function scoreLabel(score: number): string {
  if (score >= 4) return "非常开心";
  if (score >= 2) return "开心";
  if (score >= 1) return "还不错";
  if (score === 0) return "平稳";
  if (score <= -4) return "非常难过";
  if (score <= -2) return "难过";
  return "有点低落";
}

export function hourLabel(hour: number): string {
  return `${hour.toString().padStart(2, "0")}:00`;
}
