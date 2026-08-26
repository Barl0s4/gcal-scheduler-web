import { google, calendar_v3 } from "googleapis";
import { PrismaClient } from "@prisma/client";
import { ParsedEvent } from "./visionService";

import { prisma } from "./prisma";

function parseTime(timeStr: string): { hour: number; minute: number } {
    const trimmed = timeStr.trim().toLowerCase();
    const [timePart, period] = trimmed.split(" ");
    let [hour, minute] = timePart.split(":").map(Number);

    if (period === "pm" && hour !== 12) hour += 12;
    else if (period === "am" && hour === 12) hour = 0;

    return { hour, minute };
}

export function buildEventDateTimes(dateStr: string, startStr: string, endStr: string) {
    const year = new Date().getFullYear();
    const [month, day] = dateStr.split("/").map(Number);
    const { hour: startHour, minute: startMinute } = parseTime(startStr);
    const { hour: endHour, minute: endMinute } = parseTime(endStr);

    const startDate = new Date(year, month - 1, day, startHour, startMinute);
    const endDate = new Date(year, month - 1, day, endHour, endMinute);

    if (endDate <= startDate) endDate.setDate(endDate.getDate() + 1);

    return { start: startDate.toISOString(), end: endDate.toISOString() };
}

export function isFutureEvent(dateStr: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [month, day] = dateStr.split("/").map(Number);
    return new Date(today.getFullYear(), month - 1, day) >= today;
}

// Replaces the old file-based getAuthenticatedClient(). Pulls THIS user's
// stored tokens out of the Account table (populated by Auth.js on sign-in).
async function getAuthenticatedClientForUser(userId: string) {
    const account = await prisma.account.findFirst({
        where: { userId, provider: "google" },
    });

    if (!account?.access_token) {
        throw new Error("No Google account linked for this user");
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
        access_token: account.access_token,
        refresh_token: account.refresh_token,
        expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
    });

    // If Google issues a fresh access_token mid-request, persist it back —
    // otherwise every future call re-triggers an avoidable refresh.
    oauth2Client.on("tokens", async (tokens) => {
        await prisma.account.update({
        where: { id: account.id },
        data: {
            access_token: tokens.access_token ?? account.access_token,
            expires_at: tokens.expiry_date
            ? Math.floor(tokens.expiry_date / 1000)
            : account.expires_at,
        },
        });
    });

    return oauth2Client;
}

async function shiftAlreadyExists(
    calendar: calendar_v3.Calendar,
    startISO: string,
    endISO: string
): Promise<boolean> {
    const res = await calendar.events.list({
        calendarId: "primary",
        timeMin: startISO,
        timeMax: endISO,
        singleEvents: true,
        privateExtendedProperty: "source=screenshot-scheduler",
    });
    return (res.data.items || []).length > 0;
}

export async function insertEvents(userId: string, events: ParsedEvent[]) {
    const auth = await getAuthenticatedClientForUser(userId);
    const calendar = google.calendar({ version: "v3", auth });

    for (const event of events) {
        const { start, end } = buildEventDateTimes(event.date, event.start, event.end);

        if (await shiftAlreadyExists(calendar, start, end)) {
        console.log(`Skipped (already on calendar): ${event.date} ${event.start} - ${event.end}`);
        continue;
        }

        await calendar.events.insert({
        calendarId: "primary",
        requestBody: {
            summary: event.title || "Work Shift",
            start: { dateTime: start, timeZone: "America/Los_Angeles" },
            end: { dateTime: end, timeZone: "America/Los_Angeles" },
            extendedProperties: { private: { source: "screenshot-scheduler" } },
        },
        });

        console.log(`Inserted: ${event.title || "Work Shift"} on ${event.date} ${event.start} - ${event.end}`);
    }
}