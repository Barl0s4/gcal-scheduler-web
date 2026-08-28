"use client";

import { useState } from "react";
import { SpinnerIcon, TrashIcon } from "@/components/icons";
import { formatDateParts, from24Hour, sortByDate, to24Hour } from "@/lib/eventTime";
import type { ParsedEvent } from "@/lib/visionService";
import styles from "./ConfirmImportModal.module.css";

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
    <div className={styles.backdrop}>
      <div className={styles.dialog}>
        <div className={styles.header}>
          <h2 className={styles.title}>Add these to your calendar?</h2>
          <p className={styles.summary}>
            {items.length} event{items.length === 1 ? "" : "s"} found &mdash; edit or
            remove anything that&rsquo;s wrong.
          </p>
        </div>

        <div className={styles.body}>
          {items.length === 0 && (
            <div className={styles.emptyState}>Nothing left to add.</div>
          )}

          <div className={styles.list}>
            {items.map((event, i) => (
              <div key={i} className={styles.row}>
                <div className={styles.rowHeader}>
                  <div className={styles.eventTitle}>{event.title}</div>
                  <span className={styles.weekday}>
                    {formatDateParts(event.date).weekday}
                  </span>
                  <button
                    type="button"
                    aria-label="Remove event"
                    className={styles.deleteButton}
                    onClick={() => removeItem(i)}
                  >
                    <TrashIcon />
                  </button>
                </div>

                <div className={styles.fields}>
                  <input
                    type="text"
                    className={styles.field}
                    value={event.date}
                    placeholder="MM/DD"
                    onChange={(e) => updateItem(i, { date: e.target.value })}
                  />
                  <input
                    type="time"
                    className={styles.field}
                    value={to24Hour(event.start)}
                    onChange={(e) =>
                      updateItem(i, { start: from24Hour(e.target.value) })
                    }
                  />
                  <input
                    type="time"
                    className={styles.field}
                    value={to24Hour(event.end)}
                    onChange={(e) => updateItem(i, { end: from24Hour(e.target.value) })}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.cancelButton}
            disabled={submitting}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.confirmButton}
            disabled={submitting || items.length === 0}
            onClick={() => onConfirm(items)}
          >
            {submitting && <SpinnerIcon className={`${styles.confirmSpinner} spin`} />}
            {submitting ? "Adding…" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
