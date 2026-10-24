# Tiketwar-webui

Next.js dashboard answering three questions: is the scraper alive, what has it
seen, and has it actually produced anything?

The UI only talks to `Tiketwar-service` — never to the scraper or redis — so
there is exactly one place that knows the data shape.

## The banner is the point of this app
It distinguishes the ways things break, instead of showing one green dot:
- **DEAD** — service up, heartbeat missing (*box up, loop not running*)
- **Consumer DOWN** — the scraper runs but its events are not reaching the
  database, so every number on the page is stale
- **selectors rotted** — most checks return an unknown seat count, which looks
  identical to "sold out" unless you deliberately separate them (so we do)
- **unreachable** — the API itself is down

Yield % = checks-that-saw-stock over total checks. A number that quietly decays
toward zero over a week is the signal that something broke, which is why it is on
the front page and not buried in logs.

```sh
npm install
NEXT_PUBLIC_SERVICE_URL=http://localhost:8080 npm run dev
```
