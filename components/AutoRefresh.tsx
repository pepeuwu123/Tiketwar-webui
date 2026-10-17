"use client";
// A monitoring dashboard that only updates when you reload it is not a monitor.
// router.refresh() re-runs the server component's data fetch in place, so the page
// stays live without losing scroll position or flashing.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function AutoRefresh({ seconds = 10 }: { seconds?: number }) {
  const router = useRouter();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      router.refresh();
      setTick((t) => t + 1);
    }, seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);

  return (
    <span className="note" title={`refreshed ${tick} time(s) since load`}>
      live · every {seconds}s
    </span>
  );
}
