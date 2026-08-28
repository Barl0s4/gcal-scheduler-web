"use client";

import { useEffect, useState } from "react";
import { CalendarIcon, SpinnerIcon } from "@/components/icons";
import styles from "./CalendarWidget.module.css";

type UpcomingEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
};

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dayLabel(date: Date) {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

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
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <CalendarIcon />
          <span className={styles.headingText}>Your calendar</span>
        </div>

        <span className={styles.liveBadge}>
          {loading ? (
            <SpinnerIcon className={`${styles.liveSpinner} spin`} />
          ) : (
            <span className={`${styles.liveDot} pulse`} />
          )}
          Live
        </span>
      </div>

      {loading && (
        <div className={styles.skeletonList}>
          {[0, 1].map((i) => (
            <div key={i} className={styles.skeletonRow}>
              <div className={`${styles.skeletonBadge} pulse`} />
              <div className={styles.skeletonLines}>
                <div className={`${styles.skeletonLineWide} pulse`} />
                <div className={`${styles.skeletonLineNarrow} pulse`} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && events.length === 0 && (
        <div className={styles.empty}>
          Nothing on your calendar yet &mdash; upload a photo to get started.
        </div>
      )}

      {!loading && events.length > 0 && (
        <div className={styles.list}>
          {events.map((event) => {
            const start = new Date(event.start);
            const month = start
              .toLocaleDateString(undefined, { month: "short" })
              .toUpperCase();
            const timeLabel = event.allDay
              ? "All day"
              : start.toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                });

            return (
              <div key={event.id} className={styles.row}>
                <div className={styles.dateBadge}>
                  <span className={styles.dateMonth}>{month}</span>
                  <span className={styles.dateDay}>{start.getDate()}</span>
                </div>
                <div className={styles.details}>
                  <div className={styles.eventTitle}>{event.title}</div>
                  <div className={styles.eventMeta}>
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
