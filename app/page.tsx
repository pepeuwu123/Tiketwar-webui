import { getEvents, getHealth, getSummary } from "@/lib/api";

export const dynamic = "force-dynamic";

function fmt(ts: string) {
  return new Date(ts).toLocaleString("en-GB", {
    timeZone: "Asia/Jakarta", dateStyle: "short", timeStyle: "medium",
  });
}

function TypePill({ type, blocked }: { type: string; blocked: boolean }) {
  const cls = blocked ? "blocked" : type;
  return <span className={`pill ${cls}`}>{blocked ? "blocked" : type}</span>;
}

export default async function Page() {
  const [health, summary, events] = await Promise.all([getHealth(), getSummary(), getEvents()]);

  const banner =
    !health
      ? { cls: "bad", text: "Service unreachable — the API is not answering. The external watchdog should also be shouting about this." }
      : !health.scraper_alive
        ? { cls: "bad", text: `Scraper DEAD — service is up but the last heartbeat is ${health.heartbeat_age_seconds ?? "?"}s old. This is the silent failure mode.` }
        : health.last_poll_ok === false
          ? { cls: "warn", text: "Scraper is RUNNING but the last poll failed — the loop is alive, the site is not. Check the errors below; this is not a dead container." }
          : summary?.selectors_probably_broken
          ? { cls: "warn", text: "Most checks returned an unknown seat count — the selectors are probably rotted, not the tickets sold out." }
          : summary && summary.poll_errors > 0
            ? { cls: "warn", text: `${summary.poll_errors} scrape error(s) in the last ${summary.window_days} days.` }
            : { cls: "ok", text: "Scraper alive and reporting." };

  return (
    <main>
      <h1>Tiketwar</h1>
      <div className="sub">
        Availability monitor · times shown in Asia/Jakarta
        {health?.timezone && health.timezone !== "Asia/Jakarta" ? ` (service TZ: ${health.timezone})` : ""}
      </div>

      <div className={`banner ${banner.cls}`}>{banner.text}</div>

      <div className="grid">
        <div className="card">
          <div className="label">Scraper</div>
          <div className={`value ${health?.scraper_alive ? "ok" : "bad"}`}>
            {health?.scraper_alive ? "ALIVE" : "DEAD"}
          </div>
          <div className="note">
            {health?.heartbeat_age_seconds != null
              ? `last heartbeat ${health.heartbeat_age_seconds}s ago`
              : "no heartbeat seen"}
          </div>
        </div>
        <div className="card">
          <div className="label">Database</div>
          <div className={`value ${health?.db_ok ? "ok" : "bad"}`}>{health?.db_ok ? "OK" : "DOWN"}</div>
          <div className="note">Postgres reachable</div>
        </div>
        <div className="card">
          <div className="label">Checks ({summary?.window_days ?? 7}d)</div>
          <div className="value">{summary?.checks ?? "—"}</div>
          <div className="note">{summary?.events_total ?? 0} events total</div>
        </div>
        <div className="card">
          <div className="label">Yield</div>
          <div className="value">
            {summary?.yield_ratio != null ? `${(summary.yield_ratio * 100).toFixed(1)}%` : "—"}
          </div>
          <div className="note">{summary?.checks_with_stock ?? 0} checks saw stock</div>
        </div>
        <div className="card">
          <div className="label">Grabbed</div>
          <div className={`value ${summary?.grabbed_ok ? "ok" : ""}`}>{summary?.grabbed_ok ?? 0}</div>
          <div className="note">added to cart (not checked out)</div>
        </div>
        <div className="card">
          <div className="label">Blocks / errors</div>
          <div className={`value ${summary?.blocked_events || summary?.poll_errors ? "warn" : "ok"}`}>
            {summary?.blocked_events ?? 0} / {summary?.poll_errors ?? 0}
          </div>
          <div className="note">blocks need a human</div>
        </div>
      </div>

      <div className="section">
        <h1 style={{ fontSize: "1.1rem" }}>Recent events</h1>
        {!events?.events?.length ? (
          <div className="empty">
            No events yet. If the scraper is alive, this should fill within one interval.
          </div>
        ) : (
          <table>
            <thead>
              <tr><th>When</th><th>Type</th><th>Seats</th><th>Detail</th></tr>
            </thead>
            <tbody>
              {events.events.map((e) => (
                <tr key={e.id}>
                  <td><code>{fmt(e.ts)}</code></td>
                  <td><TypePill type={e.type} blocked={e.blocked} /></td>
                  <td>{e.seats ?? <span className="bad">unknown</span>}</td>
                  <td><code>{e.detail ?? "—"}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
