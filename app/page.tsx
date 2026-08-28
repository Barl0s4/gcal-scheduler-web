"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import Dropzone from "@/components/Dropzone";
import { CalendarCheckIcon, GoogleIcon, SpinnerIcon } from "@/components/icons";
import styles from "./page.module.css";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className={styles.loadingScreen}>
        <SpinnerIcon className={`${styles.loadingSpinner} spin`} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className={styles.signInScreen}>
        {/* Visible app name — must match the OAuth consent screen name
            exactly, or Google's branding verification fails. */}
        <div className={styles.brand}>
          <div className={styles.logoBadge}>
            <CalendarCheckIcon />
          </div>
          <span className={styles.wordmark}>Calendar Scheduler</span>
        </div>

        <div className={styles.intro}>
          <h1 className={styles.title}>Your schedule, synced automatically</h1>
          <p className={styles.subtitle}>
            Upload a photo of your schedule and we&rsquo;ll add every event to your
            Google Calendar &mdash; no typing.
          </p>
        </div>

        <button className={styles.googleButton} onClick={() => signIn("google")}>
          <GoogleIcon />
          Continue with Google
        </button>

        <p className={styles.finePrint}>
          We only read schedule images you upload, and only add events that
          haven&rsquo;t happened yet.
        </p>

        <p className={styles.legalLinks}>
          <Link href="/privacy">Privacy</Link>
          <span className={styles.legalDivider}>&middot;</span>
          <Link href="/terms">Terms</Link>
        </p>
      </div>
    );
  }

  const displayName = session.user?.name || session.user?.email;
  const initial = (session.user?.name ?? session.user?.email ?? "?")
    .charAt(0)
    .toUpperCase();

  return (
    <div className={styles.appShell}>
      <header className={styles.appHeader}>
        <div className={styles.identity}>
          <div className={styles.avatar}>{initial}</div>
          <span className={styles.userName}>{displayName}</span>
        </div>
        <button className={styles.signOutButton} onClick={() => signOut()}>
          Sign out
        </button>
      </header>

      <main className={styles.appMain}>
        <Dropzone />
      </main>
    </div>
  );
}
