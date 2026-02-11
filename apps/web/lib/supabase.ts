export const PERSISTENCE_MODE = "in_memory" as const;

export function getPersistenceModeLabel() {
  return "内存存储（开发模式）";
}