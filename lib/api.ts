// The UI only ever talks to the service. Never to the scraper or redis.
const BASE = process.env.NEXT_PUBLIC_SERVICE_URL ?? "http://localhost:8080";

export type Health = {
  status: string;
  db_ok: boolean;
  scraper_alive: boolean;
  heartbeat_age_seconds: number | null;
  timezone: string;
};

export type EventRow = {
  id: number; type: string; ts: string; seats: number | null;
  available: boolean | null; blocked: boolean; ok: boolean | null; detail: string | null;
};

export type Summary = {
  window_days: number; events_total: number; checks: number; poll_errors: number;
  blocked_events: number; grabbed_ok: number; checks_with_stock: number;
  checks_with_unknown_seats: number; yield_ratio: number | null;
  selectors_probably_broken: boolean;
};

async function get<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;   // "service down" is a state we render, not a crash
  }
}

export const getHealth = () => get<Health>("/healthz");
export const getSummary = () => get<Summary>("/api/summary?days=7");
export const getEvents = () => get<{ events: EventRow[] }>("/api/events?limit=50");
