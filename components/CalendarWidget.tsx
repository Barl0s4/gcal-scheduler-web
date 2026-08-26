"use client";

import { useEffect, useState } from "react";

type UpcomingEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
};

function dayLabel(date: Date) {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) return "Today";
  if (sameDay(date, tomorrow)) return "Tomorrow";
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

export default function CalendarWidget() {
  const [events, setEvents] = useState<UpcomingEvent[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/calendar")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load calendar");
        const data = await res.json();
        if (!cancelled) setEvents(data.events);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) return null;

  const loading = events === null;

  return (
    <div className="w-full rounded-[16px] border border-border bg-card px-4 py-3.5 shadow-[0_1px_6px_oklch(30%_0.02_50_/_0.04)]">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
            <path d="M3.5 9.8h17" />
            <path d="M8 3v3.6" />
            <path d="M16 3v3.6" />
          </svg>
          <span className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
            Your calendar
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-[10.5px] font-semibold text-muted-foreground">
          {loading ? (
            <svg
              className="h-2.5 w-2.5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            </svg>
          ) : (
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[oklch(62%_0.14_150)]" />
          )}
          Live
        </span>
      </div>

      {loading && (
        <div className="flex flex-col gap-2">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-accent/10" />
              <div className="flex-1">
                <div className="mb-1.5 h-2.5 w-3/5 animate-pulse rounded bg-accent/10" />
                <div className="h-2 w-2/5 animate-pulse rounded bg-accent/10" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && events!.length === 0 && (
        <div className="py-2 text-center text-[12.5px] text-muted-foreground">
          Nothing on your calendar yet &mdash; upload a photo to get started.
        </div>
      )}

      {!loading && events!.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {events!.map((event) => {
            const start = new Date(event.start);
            const month = start
              .toLocaleDateString(undefined, { month: "short" })
              .toUpperCase();
            const day = start.getDate();
            const timeLabel = event.allDay
              ? "All day"
              : start.toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                });

            return (
              <div key={event.id} className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg bg-accent/12 leading-none">
                  <span className="text-[8.5px] font-bold text-accent">{month}</span>
                  <span className="text-[12.5px] font-bold">{day}</span>
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="truncate text-[13px] font-bold">{event.title}</div>
                  <div className="text-[11.5px] text-muted-foreground">
                    {dayLabel(start)} &middot; {timeLabel}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
