import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { ParsedEvent } from "@/lib/visionService";
import { isFutureEvent, insertEvents } from "@/lib/calendarService";

function isParsedEvent(value: unknown): value is ParsedEvent {
    if (!value || typeof value !== "object") return false;
    const e = value as Record<string, unknown>;
    return (
        typeof e.title === "string" &&
        typeof e.date === "string" &&
        typeof e.start === "string" &&
        typeof e.end === "string"
    );
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const rawEvents: unknown[] = Array.isArray(body?.events) ? body.events : [];
    const events: ParsedEvent[] = rawEvents.filter(isParsedEvent);
    if (events.length === 0) {
        return NextResponse.json({ error: "No events to add" }, { status: 400 });
    }

    try {
        const futureEvents = events.filter((e: ParsedEvent) => isFutureEvent(e.date));
        await insertEvents(session.user.id, futureEvents);

        return NextResponse.json({
        message: `Done! ${futureEvents.length} events inserted into your Google Calendar.`,
        count: futureEvents.length,
        });
    } catch (err) {
        console.error("Error:", err);
        const message = err instanceof Error ? err.message : "Something went wrong";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
