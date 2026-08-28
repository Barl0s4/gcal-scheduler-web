import type { ParsedEvent } from "./visionService";

/**
 * Time/date helpers for the review step.
 *
 * Events move through the app as human-readable strings ("9/02",
 * "5:15 pm"). These convert to and from the machine formats the
 * <input type="time"> element and sorting need.
 */

/** "5:15 pm" -> "17:15" (what <input type="time"> expects). */
export function to24Hour(time: string): string {
    const match = (time || "").trim().toLowerCase().match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/);
    if (!match) return "";

    let hour = parseInt(match[1], 10);
    const [, , minute, period] = match;

    if (period === "pm" && hour !== 12) hour += 12;
    else if (period === "am" && hour === 12) hour = 0;

    return `${String(hour).padStart(2, "0")}:${minute}`;
}

/** "17:15" -> "5:15 pm" (the format we send to the calendar). */
export function from24Hour(value: string): string {
    if (!value) return "";

    const [h, m] = value.split(":").map(Number);
    const period = h >= 12 ? "pm" : "am";
    const hour12 = h % 12 === 0 ? 12 : h % 12;

    return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

/** Splits "5:15 pm" into 24-hour parts for date math. */
function parseTimeParts(time: string): { hour: number; minute: number } {
    const [timePart, period] = (time || "").trim().toLowerCase().split(" ");
    const [h, m] = (timePart || "").split(":").map(Number);

    let hour = Number.isFinite(h) ? h : 0;
    const minute = Number.isFinite(m) ? m : 0;

    if (period === "pm" && hour !== 12) hour += 12;
    else if (period === "am" && hour === 12) hour = 0;

    return { hour, minute };
}

/** Month/day label for a "MM/DD" string, e.g. { month: "SEP", day: 2 }. */
export function formatDateParts(dateStr: string) {
    const [month, day] = dateStr.split("/").map(Number);
    const date = new Date(new Date().getFullYear(), (month || 1) - 1, day || 1);

    return {
        month: date.toLocaleDateString(undefined, { month: "short" }).toUpperCase(),
        day: date.getDate(),
        weekday: date.toLocaleDateString(undefined, { weekday: "short" }),
    };
}

/** Sorts events earliest to latest, comparing real date + start time. */
export function sortByDate(events: ParsedEvent[]): ParsedEvent[] {
    const timestamp = (event: ParsedEvent) => {
        const [month, day] = event.date.split("/").map(Number);
        const { hour, minute } = parseTimeParts(event.start);
        return new Date(
        new Date().getFullYear(),
        (month || 1) - 1,
        day || 1,
        hour,
        minute
        ).getTime();
    };

    return [...events].sort((a, b) => timestamp(a) - timestamp(b));
}
