"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CalendarWidget from "@/components/CalendarWidget";
import ConfirmImportModal from "@/components/ConfirmImportModal";
import {
  AlertIcon,
  CameraIcon,
  CheckIcon,
  CloseIcon,
  PhotosIcon,
  SpinnerIcon,
  UploadIcon,
} from "@/components/icons";
import type { ParsedEvent } from "@/lib/visionService";
import styles from "./Dropzone.module.css";

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

  const busy = status === "uploading";

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
    <div className={styles.wrapper}>
      <div className={styles.intro}>
        <h1 className={styles.title}>Drop in your schedule</h1>
        <p className={styles.subtitle}>
          A syllabus, itinerary, or timetable &mdash; we&rsquo;ll take it from here.
        </p>
      </div>

      <CalendarWidget key={calendarRefreshKey} />

      <div
        className={styles.dropCard}
        onClick={() => !busy && fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file && !busy) setSelectedFile(file);
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className={styles.hiddenInput}
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
          className={styles.hiddenInput}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setSelectedFile(file);
          }}
        />

        {status === "idle" && !selectedFile && (
          <>
            <div className={styles.statusBadge}>
              <UploadIcon />
            </div>
            <div className={styles.dropPrompt}>Drag a photo here, or</div>
            <div className={styles.choosePhotoPill}>Choose photo</div>
          </>
        )}

        {status === "idle" && selectedFile && previewUrl && (
          <>
            <div className={styles.previewWrap}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Selected schedule photo"
                className={styles.previewImage}
              />
              <button
                type="button"
                aria-label="Remove photo"
                className={styles.removePhotoButton}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
              >
                <CloseIcon />
              </button>
            </div>
            <div className={styles.fileName}>{selectedFile.name}</div>
            <div className={styles.fileHint}>Tap to use a different photo</div>
          </>
        )}

        {status === "uploading" && (
          <>
            <SpinnerIcon className={`${styles.busySpinner} spin`} />
            <div className={styles.statusText}>Reading your schedule&hellip;</div>
          </>
        )}

        {status === "done" && (
          <>
            <div className={`${styles.statusBadge} ${styles.statusBadgeSuccess}`}>
              <CheckIcon />
            </div>
            <div className={styles.statusText}>{message}</div>
          </>
        )}

        {status === "error" && (
          <>
            <div className={`${styles.statusBadge} ${styles.statusBadgeError}`}>
              <AlertIcon />
            </div>
            <div className={`${styles.statusText} ${styles.statusTextError}`}>
              {message}
            </div>
          </>
        )}
      </div>

      <div className={styles.sharedCard}>
        <button
          type="button"
          className={styles.toggleRow}
          onClick={() => setSharedSchedule((on) => !on)}
        >
          <span>
            <span className={styles.toggleTitle}>Shared schedule?</span>
            <span className={styles.toggleHint}>Tell us how to spot your shifts</span>
          </span>
          <span
            role="switch"
            aria-checked={sharedSchedule}
            className={`${styles.switchTrack} ${sharedSchedule ? styles.switchTrackOn : ""}`}
          >
            <span
              className={`${styles.switchKnob} ${sharedSchedule ? styles.switchKnobOn : ""}`}
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
            className={styles.contextInput}
          />
        )}
      </div>

      <div className={styles.sourceButtons}>
        <button
          type="button"
          className={styles.sourceButton}
          onClick={() => !busy && cameraInputRef.current?.click()}
        >
          <CameraIcon />
          Camera
        </button>
        <button
          type="button"
          className={styles.sourceButton}
          onClick={() => !busy && fileInputRef.current?.click()}
        >
          <PhotosIcon />
          Photos
        </button>
      </div>

      <button
        type="button"
        className={styles.uploadButton}
        disabled={!selectedFile || busy}
        onClick={() => selectedFile && uploadFile(selectedFile)}
      >
        {busy && <SpinnerIcon className={`${styles.uploadSpinner} spin`} />}
        {busy ? "Reading your schedule…" : "Upload"}
      </button>

      <div className={styles.footnote}>Only future-dated events are added.</div>

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
