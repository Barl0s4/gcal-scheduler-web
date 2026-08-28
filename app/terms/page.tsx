import Link from "next/link";
import type { Metadata } from "next";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Terms of Service — Calendar Scheduler",
};

export default function TermsOfService() {
  return (
    <div className={styles.page}>
      <Link href="/" className={styles.backLink}>
        &larr; Back to Calendar Scheduler
      </Link>

      <h1 className={styles.title}>Terms of Service</h1>
      <p className={styles.effectiveDate}>Effective August 26, 2026</p>

      <div className={styles.content}>
        <section>
          <h2>1. Acceptance</h2>
          <p>
            By using Calendar Scheduler (&ldquo;the App&rdquo;), you agree to these
            terms. If you don&rsquo;t agree, please don&rsquo;t use the App.
          </p>
        </section>

        <section>
          <h2>2. What the App does</h2>
          <p>
            The App lets you upload a photo of a schedule and, after you review and
            confirm what it finds, adds those events to your Google Calendar.
          </p>
        </section>

        <section>
          <h2>3. Your content</h2>
          <p>
            You&rsquo;re responsible for the photos you upload. If a schedule includes
            other people&rsquo;s shifts &mdash; for example, a shared work schedule
            &mdash; only upload it if you have the right to do so, and use the
            &ldquo;Shared schedule?&rdquo; option only to identify your own shifts, not
            anyone else&rsquo;s.
          </p>
        </section>

        <section>
          <h2>4. Accuracy</h2>
          <p>
            Event extraction uses AI and may misread dates, times, or names &mdash;
            especially on dense or shared schedules. Always review the events shown
            before confirming; the App won&rsquo;t add anything to your calendar without
            that confirmation, and you can edit or remove any event first.
          </p>
        </section>

        <section>
          <h2>5. No warranty</h2>
          <p>
            The App is provided &ldquo;as is,&rdquo; without warranties of any kind. We
            don&rsquo;t guarantee it will be error-free, uninterrupted, or fit for any
            particular purpose.
          </p>
        </section>

        <section>
          <h2>6. Limitation of liability</h2>
          <p>
            To the extent permitted by law, we aren&rsquo;t liable for any damages
            arising from your use of the App, including missed or incorrect calendar
            events.
          </p>
        </section>

        <section>
          <h2>7. Changes</h2>
          <p>We may update these terms or the App at any time.</p>
        </section>

        <section>
          <h2>8. Contact</h2>
          <p>
            Questions about these terms? Email{" "}
            <a href="mailto:9cguizar2004@gmail.com">9cguizar2004@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
