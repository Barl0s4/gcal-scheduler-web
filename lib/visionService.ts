import { GoogleGenerativeAI } from "@google/generative-ai";

export type ParsedEvent = {
    title: string;
    date: string;
    start: string;
    end: string;
};

export async function parseCalendarImage(
    imageBuffer: Buffer,
    mimeType: string = "image/png",
    personalContext?: string
): Promise<ParsedEvent[]> {
    const base64Image = imageBuffer.toString("base64");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
        model: "gemini-3.5-flash-lite",
        generationConfig: { responseMimeType: "application/json" },
    });

    const sharedScheduleNote = personalContext
        ? `
            This image may show a shared schedule with shifts for several people together
            (e.g. a grid with colored cells and short codes, or a legend mapping colors to
            names). The user has told you how to identify their own shifts:
            "${personalContext}"
            Only extract shifts that belong to this person, matching whatever the
            description points to: a name, initials, a short code, a color (if a legend is
            shown), or a row/column position. Apply this filter across every schedule
            table or grid shown in the image, not just the first one. Ignore shifts that
            clearly belong to someone else. If you can't tell whose shift is whose, extract
            all shifts rather than guessing incorrectly.
        `
        : "";

    const prompt = `
        You are an assistant that extracts a work schedule from a photo or screenshot.
        Schedules come in different layouts, so look carefully at how this one is laid
        out before extracting anything:

        - A personal weekly table: each column is a day of the week with its date
            (e.g. "Mon 8/17"), and each day lists zero, one, or two shifts as start/end
            time pairs (e.g. "5:15p" over "11:00p"). A day marked "OFF" or left blank has
            no shift. The image may stack several of these weekly tables on top of each
            other (e.g. "Current Week 8/17", "Beginning 8/24") — extract shifts from
            every week table shown, using each table's own date header to work out the
            real date for each day column, not just the weekday name.
        - A shared grid: rows are times of day, and each day is split into several
            sub-columns (e.g. station or team initials). Cells are filled with a color
            and a short 2-3 letter code identifying who's working. A run of consecutive
            time rows in the same day+sub-column with the same code is ONE shift — its
            start is the first row of the run and its end is the row after the last
            matching row. The same code can appear as more than one separate run on the
            same day (a split shift) — treat each run as its own shift, don't merge
            them. The image may contain several such grids stacked for different weeks —
            extract shifts from every grid shown.
        - Other layouts are possible too. In general: find every distinct labeled work
            period in the image, and for each one work out its real calendar date, start
            time, and end time from the surrounding row, column, and header labels.

        ${sharedScheduleNote}

        If you can identify the employer or workplace name shown anywhere in the image
        (e.g. a logo or label like "In-N-Out"), use it to build a short title for each
        shift, formatted like "In-N-Out Shift". If you can't identify an employer,
        use "Work Shift" as the title.

        Ignore anything marked "OFF", left blank, or that isn't an actual shift (e.g.
        a holiday label with no time attached to it).

        Extract every shift you find and return it in JSON format:
        [
            { "title": "e.g. In-N-Out Shift", "date": "Event Date MM/DD", "start": "HH:MM am/pm", "end": "HH:MM am/pm" },
            ...
        ]
        If there are no shifts, return an empty array.
    `;

    const imagePart = { inlineData: { data: base64Image, mimeType } };
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    try {
        return JSON.parse(responseText) as ParsedEvent[];
    } catch {
        console.error("Failed to parse Gemini response as JSON:", responseText);
        throw new Error("Gemini did not return valid JSON");
    }
}