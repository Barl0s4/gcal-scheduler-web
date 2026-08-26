import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listUpcomingEvents } from "@/lib/calendarService";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    try {
        const events = await listUpcomingEvents(session.user.id, 5);
        return NextResponse.json({ events });
    } catch (err) {
        console.error("Error fetching calendar events:", err);
        const message = err instanceof Error ? err.message : "Something went wrong";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
