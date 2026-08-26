import { GoogleGenerativeAI } from "@google/generative-ai";

export type ParsedEvent = {
    title: string;
    date: string;
    start: string;
    end: string;
};

export async function parseCalendarImage(
    imageBuffer: Buffer,
    mimeType: string = "image/png"
): Promise<ParsedEvent[]> {
    const base64Image = imageBuffer.toString("base64");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
        model: "gemini-3.5-flash-lite",
        generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `
        You are an assistant that extracts a work schedule from images.
        The image contains a small calendar showing the current week, dates, and times.
        If you can identify the employer or workplace name shown anywhere in the image
        (e.g. a logo or label like "In-N-Out"), use it to build a short title for each
        shift, formatted like "In-N-Out Shift". If you can't identify an employer,
        use "Work Shift" as the title.
        If the day explicitly says off, ignore it.
        Extract the following information from the image and return it in JSON format:
        [
        { "title": "e.g. In-N-Out Shift", "date": "Event Date MM/DD", "start": "HH:MM am/pm", "end": "HH:MM am/pm" },
        ...
        ]
        If there are no events, return an empty array.
    `;

    const imagePart = { inlineData: { data: base64Image, mimeType } };
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    try {
        return JSON.parse(responseText) as ParsedEvent[];
    } catch (err) {
        console.error("Failed to parse Gemini response as JSON:", responseText);
        throw new Error("Gemini did not return valid JSON");
    }
}