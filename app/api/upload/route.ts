import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { parseCalendarImage } from "@/lib/visionService";
import { isFutureEvent, insertEvents } from "@/lib/calendarService";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const events = await parseCalendarImage(buffer, file.type || "image/png");
        const futureEvents = events.filter((e) => isFutureEvent(e.date));

        console.log(`Total events: ${events.length}, Future events: ${futureEvents.length}`);
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