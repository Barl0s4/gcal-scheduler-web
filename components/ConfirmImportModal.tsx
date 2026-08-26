"use client";

import { useState } from "react";
import type { ParsedEvent } from "@/lib/visionService";

function formatDateParts(dateStr: string) {
  const [month, day] = dateStr.split("/").map(Number);
  const date = new Date(new Date().getFullYear(), (month || 1) - 1, day || 1);
  return {
    month: date.toLocaleDateString(undefined, { month: "short" }).toUpperCase(),
    day: date.getDate(),
    weekday: date.toLocaleDateString(undefined, { weekday: "short" }),
  };
}

function to24Hour(time: string) {
  const match = (time || "").trim().toLowerCase().match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/);
  if (!match) return "";
  let hour = parseInt(match[1], 10);
  const minute = match[2];
  const period = match[3];
  if (period === "pm" && hour !== 12) hour += 12;
  else if (period === "am" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${minute}`;
}

function from24Hour(value: string) {
  if (!value) return "";
  const [h, m] = value.split(":").map(Number);
  const period = h >= 12 ? "pm" : "am";
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function parseTimeString(time: string) {
  const trimmed = (time || "").trim().toLowerCase();
  const [timePart, period] = trimmed.split(" ");
  const [h, m] = (timePart || "").split(":").map(Number);
  let hour = Number.isFinite(h) ? h : 0;
  const minute = Number.isFinite(m) ? m : 0;
  if (period === "pm" && hour !== 12) hour += 12;
  else if (period === "am" && hour === 12) hour = 0;
  return { hour, minute };
}

function toTimestamp(event: ParsedEvent) {
  const [month, day] = event.date.split("/").map(Number);
  const { hour, minute } = parseTimeString(event.start);
  return new Date(
    new Date().getFullYear(),
    (month || 1) - 1,
    day || 1,
    hour,
    minute
  ).getTime();
}

function sortByDate(events: ParsedEvent[]) {
  return [...events].sort((a, b) => toTimestamp(a) - toTimestamp(b));
}

export default function ConfirmImportModal({
  events,
  submitting,
  onCancel,
  onConfirm,
}: {
  events: ParsedEvent[];
  submitting: boolean;
  onCancel: () => void;
  onConfirm: (events: ParsedEvent[]) => void;
}) {
  const [items, setItems] = useState<ParsedEvent[]>(() => sortByDate(events));

  function updateItem(index: number, patch: Partial<ParsedEvent>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[oklch(20%_0.02_50_/_0.45)] px-5">
      <div className="flex max-h-[85vh] w-full max-w-sm flex-col overflow-hidden rounded-[22px] border border-border bg-card shadow-[0_16px_40px_oklch(20%_0.03_50_/_0.25)]">
        <div className="px-6 pt-6 pb-4 text-center">
          <h2 className="font-serif text-[24px] leading-[1.2] italic">
            Add these to your calendar?
          </h2>
          <p className="mt-1.5 text-[13px] font-medium text-muted-foreground">
            {items.length} event{items.length === 1 ? "" : "s"} found &mdash; edit or
            remove anything that&rsquo;s wrong.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto border-t border-border px-5 py-2">
          {items.length === 0 && (
            <div className="py-6 text-center text-[13px] text-muted-foreground">
              Nothing left to add.
            </div>
          )}
          <div className="flex flex-col divide-y divide-border">
            {items.map((event, i) => {
              const { weekday } = formatDateParts(event.date);
              return (
                <div key={i} className="flex flex-col gap-2 py-3">
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1 truncate text-left text-[13px] font-bold">
                      {event.title}
                    </div>
                    <span className="shrink-0 text-[11px] font-semibold text-muted-foreground">
                      {weekday}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      aria-label="Remove event"
                      className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-[oklch(90%_0.05_30)] hover:text-[oklch(45%_0.12_30)]"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 7h16" />
                        <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                        <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-[56px_1fr_1fr] gap-2">
                    <input
                      type="text"
                      value={event.date}
                      onChange={(e) => updateItem(i, { date: e.target.value })}
                      placeholder="MM/DD"
                      className="w-full min-w-0 rounded-md border border-border bg-background px-1.5 py-1 text-center text-[11px] outline-none focus:border-accent"
                    />
                    <input
                      type="time"
                      value={to24Hour(event.start)}
                      onChange={(e) => updateItem(i, { start: from24Hour(e.target.value) })}
                      className="w-full min-w-0 rounded-md border border-border bg-background px-1.5 py-1 text-center text-[11px] outline-none focus:border-accent"
                    />
                    <input
                      type="time"
                      value={to24Hour(event.end)}
                      onChange={(e) => updateItem(i, { end: from24Hour(e.target.value) })}
                      className="w-full min-w-0 rounded-md border border-border bg-background px-1.5 py-1 text-center text-[11px] outline-none focus:border-accent"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 cursor-pointer rounded-xl border border-border bg-card py-3 text-[13.5px] font-bold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(items)}
            disabled={submitting || items.length === 0}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent py-3 text-[13.5px] font-bold text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting && (
              <svg
                className="h-3.5 w-3.5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              </svg>
            )}
            {submitting ? "Adding…" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
