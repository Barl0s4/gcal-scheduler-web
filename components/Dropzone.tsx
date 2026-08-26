"use client";

import { useState, useRef } from "react";

export default function Dropzone() {
    const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
    const [message, setMessage] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    function uploadFile(file: File) {
        setStatus("uploading");

        const formData = new FormData();
        formData.append("file", file);

        fetch("/api/upload", {
        method: "POST",
        body: formData,
        })
        .then(async (response) => {
            const data = await response.json();
            if (response.ok) {
            setStatus("done");
            setMessage(data.message || "Upload successful");
            } else {
            setStatus("error");
            setMessage(data.error || "Upload failed");
            }
        })
        .catch((error) => {
            console.error("Error uploading file:", error);
            setStatus("error");
            setMessage(
            "Upload failed: " + (error instanceof Error ? error.message : "Unknown error")
            );
        });
    }

    return (
        <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) uploadFile(file);
        }}
        style={{
            border: "2px dashed gray",
            padding: "40px",
            textAlign: "center",
            cursor: "pointer",
        }}
        >
        <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadFile(file);
            }}
        />

        {status === "idle" && <p>Drag & drop your calendar screenshot here, or click to browse</p>}
        {status === "uploading" && <p>Uploading...</p>}
        {status === "done" && <p>{message}</p>}
        {status === "error" && <p style={{ color: "red" }}>{message}</p>}
        </div>
    );
}