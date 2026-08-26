"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import Dropzone from "@/components/Dropzone";

function GoogleIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34 5.5 29.3 3.5 24 3.5 12.7 3.5 3.5 12.7 3.5 24S12.7 44.5 24 44.5 44.5 35.3 44.5 24c0-1.2-.1-2.4-.3-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34 5.5 29.3 3.5 24 3.5c-7.7 0-14.4 4.4-17.7 10.8z"
      />
      <path
        fill="#4CAF50"
        d="M24 44.5c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.6 2.2-7.2 2.2-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.5 40 16.2 44.5 24 44.5z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.7l6.2 5.2c-.4.4 6.6-4.8 6.6-14.9 0-1.2-.1-2.4-.3-3.5z"
      />
    </svg>
  );
}

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <svg
          className="h-7 w-7 animate-spin text-accent"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <path d="M21 12a9 9 0 1 1-2.64-6.36" />
        </svg>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-7 px-8 py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 shadow-[0_1px_2px_oklch(30%_0.02_50_/_0.06)]">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3.5" y="5" width="17" height="15.5" rx="3.5" />
            <path d="M3.5 9.8h17" />
            <path d="M8 3v3.6" />
            <path d="M16 3v3.6" />
            <path d="M8.3 14.2l2.1 2.1L15.7 12" />
          </svg>
        </div>

        <div className="flex flex-col gap-2.5">
          <h1 className="max-w-xs font-serif text-[34px] leading-[1.15] italic">
            Your schedule, synced automatically
          </h1>
          <p className="max-w-xs text-sm leading-relaxed font-medium text-muted-foreground">
            Upload a photo of your schedule and we&rsquo;ll add every event to
            your Google Calendar &mdash; no typing.
          </p>
        </div>

        <button
          onClick={() => signIn("google")}
          className="flex w-full max-w-[300px] cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-accent px-6 py-4 text-[15px] font-bold text-accent-foreground shadow-[0_6px_16px_oklch(35%_0.03_50_/_0.18)]"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <p className="max-w-[260px] text-xs leading-relaxed text-muted-foreground">
          We only read schedule images you upload, and only add events that
          haven&rsquo;t happened yet.
        </p>

        <p className="text-xs text-muted-foreground">
          <Link href="/privacy" className="underline">
            Privacy
          </Link>
          <span className="mx-2">&middot;</span>
          <Link href="/terms" className="underline">
            Terms
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between px-6 pt-5 pb-1">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
            {(session.user?.name ?? session.user?.email ?? "?")
              .charAt(0)
              .toUpperCase()}
          </div>
          <span className="text-[14.5px] font-bold">
            {session.user?.name || session.user?.email}
          </span>
        </div>
        <button
          onClick={() => signOut()}
          className="cursor-pointer text-[13px] font-semibold text-accent"
        >
          Sign out
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-6">
        <Dropzone />
      </div>
    </div>
  );
}
