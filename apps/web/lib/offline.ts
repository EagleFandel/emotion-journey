"use client";

import { useEffect, useState } from "react";

export interface OfflineQueuedEntry {
  occurredAt: string;
  score: number;
  note: string;
  source: "offline_queue";
}

const STORAGE_KEY = "emotion_journey_offline_queue";

function readQueue(): OfflineQueuedEntry[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as OfflineQueuedEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: OfflineQueuedEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function useOfflineQueue() {
  const [count, setCount] = useState(() => (typeof window !== "undefined" ? readQueue().length : 0));

  function enqueue(payload: OfflineQueuedEntry) {
    const queue = readQueue();
    queue.push(payload);
    saveQueue(queue);
    setCount(queue.length);
  }

  async function flush() {
    const queue = readQueue();
    if (queue.length === 0) return 0;

    const remaining: OfflineQueuedEntry[] = [];

    for (const item of queue) {
      try {
        const response = await fetch("/api/mood-entries", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(item),
        });

        if (!response.ok) {
          remaining.push(item);
        }
      } catch {
        remaining.push(item);
      }
    }

    saveQueue(remaining);
    setCount(remaining.length);
    return queue.length - remaining.length;
  }

  useEffect(() => {
    function onOnline() {
      void flush();
    }

    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("online", onOnline);
    };
  }, []);

  return {
    count,
    enqueue,
    flush,
  };
}