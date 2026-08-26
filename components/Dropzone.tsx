"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CalendarWidget from "@/components/CalendarWidget";
import ConfirmImportModal from "@/components/ConfirmImportModal";
import type { ParsedEvent } from "@/lib/visionService";

type Status = "idle" | "uploading" | "done" | "error";

export default function Dropzone() {
    const [status, setStatus] = useState<Status>("idle");
    const [message, setMessage] = useState("");
    const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);
    const [sharedSchedule, setSharedSchedule] = useState(false);
    const [personalContext, setPersonalContext] = useState("");
    const [pendingEvents, setPendingEvents] = useState<ParsedEvent[] | null>(null);
    const [confirming, setConfirming] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const previewUrl = useMemo(
        () => (selectedFile ? URL.createObjectURL(selectedFile) : null),
        [selectedFile]
    );
    useEffect(() => {
        return () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    function uploadFile(file: File) {
        setStatus("uploading");
        setSelectedFile(null);

        const formData = new FormData();
        formData.append("file", file);
        if (sharedSchedule && personalContext.trim()) {
        formData.append("personalContext", personalContext.trim());
        }

        fetch("/api/upload", {
        method: "POST",
        body: formData,
        })
        .then(async (response) => {
            const data = await response.json();
            if (!response.ok) {
            setStatus("error");
            setMessage(data.error || "Upload failed");
            return;
            }

            const events: ParsedEvent[] = data.events || [];
            if (events.length === 0) {
            setStatus("error");
            setMessage("No events found in that photo");
            return;
            }

            setStatus("idle");
            setPendingEvents(events);
        })
        .catch((error) => {
            console.error("Error uploading file:", error);
            setStatus("error");
            setMessage(
            "Upload failed: " + (error instanceof Error ? error.message : "Unknown error")
            );
        });
    }

    function confirmImport(events: ParsedEvent[]) {
        if (events.length === 0) return;
        setConfirming(true);

        fetch("/api/upload/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events }),
        })
        .then(async (response) => {
            const data = await response.json();
            setConfirming(false);
            setPendingEvents(null);
            if (response.ok) {
            setStatus("done");
            setMessage(data.message || "Events added");
            setCalendarRefreshKey((key) => key + 1);
            } else {
            setStatus("error");
            setMessage(data.error || "Couldn't add those events");
            }
        })
        .catch((error) => {
            console.error("Error confirming import:", error);
            setConfirming(false);
            setPendingEvents(null);
            setStatus("error");
            setMessage(
            "Couldn't add those events: " +
                (error instanceof Error ? error.message : "Unknown error")
            );
        });
    }

    return (
        <div className="flex w-full max-w-sm flex-col items-center gap-5 text-center">
        <div className="flex flex-col gap-2">
            <h1 className="font-serif text-[27px] leading-[1.2] italic">
            Drop in your schedule
            </h1>
            <p className="max-w-[290px] text-[13.5px] leading-relaxed font-medium text-muted-foreground">
            A syllabus, itinerary, or timetable &mdash; we&rsquo;ll take it from here.
            </p>
        </div>

        <CalendarWidget key={calendarRefreshKey} />

        <div
            onClick={() => status !== "uploading" && fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file && status !== "uploading") setSelectedFile(file);
            }}
            className="w-full cursor-pointer rounded-[18px] border border-border bg-card px-6 py-8 shadow-[0_2px_12px_oklch(30%_0.02_50_/_0.05)]"
        >
            <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setSelectedFile(file);
            }}
            />
            <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setSelectedFile(file);
            }}
            />

            {status === "idle" && !selectedFile && (
            <>
                <div className="mx-auto mb-3.5 flex h-13 w-13 items-center justify-center rounded-full bg-accent/15">
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M4 15.5v2.5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2.5" />
                    <path d="M7 9l5-5 5 5" />
                    <path d="M12 4v11" />
                </svg>
                </div>
                <div className="mb-3.5 text-[14.5px] font-bold">
                Drag a photo here, or
                </div>
                <div className="inline-flex items-center gap-2 rounded-[10px] bg-accent px-[18px] py-2.5 text-[13.5px] font-bold text-accent-foreground">
                Choose photo
                </div>
            </>
            )}

            {status === "idle" && selectedFile && previewUrl && (
            <>
                <div className="relative mx-auto mb-3 h-20 w-20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={previewUrl}
                    alt="Selected schedule photo"
                    className="h-20 w-20 rounded-xl object-cover"
                />
                <button
                    type="button"
                    onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    }}
                    aria-label="Remove photo"
                    className="absolute -top-2 -right-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                </button>
                </div>
                <div className="mx-auto max-w-[240px] truncate text-[14px] font-bold">
                {selectedFile.name}
                </div>
                <div className="mt-1 text-[12px] text-muted-foreground">
                Tap to use a different photo
                </div>
            </>
            )}

            {status === "uploading" && (
            <>
                <svg
                className="mx-auto mb-3 h-7 w-7 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2.2"
                strokeLinecap="round"
                >
                <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                </svg>
                <div className="text-[14.5px] font-bold">Reading your schedule&hellip;</div>
            </>
            )}

            {status === "done" && (
            <>
                <div className="mx-auto mb-3.5 flex h-13 w-13 items-center justify-center rounded-full bg-[oklch(88%_0.05_150)]">
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="oklch(38% 0.08 150)"
                    strokeWidth="2.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M6 12.5l4 4 8-8.5" />
                </svg>
                </div>
                <div className="text-[14.5px] font-bold">{message}</div>
            </>
            )}

            {status === "error" && (
            <>
                <div className="mx-auto mb-3.5 flex h-13 w-13 items-center justify-center rounded-full bg-[oklch(90%_0.05_30)]">
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="oklch(45% 0.12 30)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                >
                    <path d="M12 8v5" />
                    <path d="M12 16.2v.1" />
                </svg>
                </div>
                <div className="text-[14.5px] font-bold text-[oklch(38%_0.1_30)]">
                {message}
                </div>
            </>
            )}
        </div>

        <div className="w-full rounded-[16px] border border-border bg-card px-4 py-3.5 text-left">
            <button
            type="button"
            onClick={() => setSharedSchedule((v) => !v)}
            className="flex w-full items-center justify-between gap-3"
            >
            <span>
                <span className="block text-[13px] font-bold">Shared schedule?</span>
                <span className="block text-[11.5px] text-muted-foreground">
                Tell us how to spot your shifts
                </span>
            </span>
            <span
                role="switch"
                aria-checked={sharedSchedule}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                sharedSchedule ? "bg-accent" : "bg-border"
                }`}
            >
                <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    sharedSchedule ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
                />
            </span>
            </button>

            {sharedSchedule && (
            <input
                type="text"
                value={personalContext}
                onChange={(e) => setPersonalContext(e.target.value)}
                maxLength={200}
                placeholder="e.g. Alex, blue column, top row"
                className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] outline-none focus:border-accent"
            />
            )}
        </div>

        <div className="flex w-full gap-3">
            <button
            type="button"
            onClick={() => status !== "uploading" && cameraInputRef.current?.click()}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-card px-3.5 py-3 text-[13px] font-semibold"
            >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-2h7l1 2h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5z" />
                <circle cx="12" cy="13" r="3.4" />
            </svg>
            Camera
            </button>
            <button
            type="button"
            onClick={() => status !== "uploading" && fileInputRef.current?.click()}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-card px-3.5 py-3 text-[13px] font-semibold"
            >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3.5" y="4.5" width="17" height="15" rx="3" />
                <circle cx="9" cy="10" r="1.7" />
                <path d="M5 17l4.5-5 3.5 4 2.5-3 4 4.5" />
            </svg>
            Photos
            </button>
        </div>

        <button
            type="button"
            disabled={!selectedFile || status === "uploading"}
            onClick={() => selectedFile && uploadFile(selectedFile)}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 text-[14.5px] font-bold text-accent-foreground shadow-[0_6px_16px_oklch(35%_0.03_50_/_0.18)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
            {status === "uploading" && (
            <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            >
                <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            </svg>
            )}
            {status === "uploading" ? "Reading your schedule…" : "Upload"}
        </button>

        <div className="text-[11.5px] text-muted-foreground">
            Only future-dated events are added.
        </div>

        {pendingEvents && (
            <ConfirmImportModal
            events={pendingEvents}
            submitting={confirming}
            onCancel={() => setPendingEvents(null)}
            onConfirm={confirmImport}
            />
        )}
        </div>
    );
}
