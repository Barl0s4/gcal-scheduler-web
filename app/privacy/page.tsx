import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Calendar Scheduler",
};

export default function PrivacyPolicy() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-14">
      <Link href="/" className="text-[13px] font-semibold text-accent">
        &larr; Back to Calendar Scheduler
      </Link>

      <h1 className="mt-6 font-serif text-[34px] leading-[1.15] italic">
        Privacy Policy
      </h1>
      <p className="mt-2 text-[13px] text-muted-foreground">
        Effective August 26, 2026
      </p>

      <div className="mt-8 flex flex-col gap-7 text-[14.5px] leading-relaxed">
        <p>
          Calendar Scheduler (&ldquo;the App&rdquo;) turns a photo of your schedule into
          events on your Google Calendar. This page explains what information we
          collect and how we use it.
        </p>

        <section>
          <h2 className="mb-2 text-[15px] font-bold">Information we collect</h2>
          <ul className="flex flex-col gap-1.5 pl-4 list-disc">
            <li>
              <span className="font-semibold">Your Google account info</span> &mdash;
              when you sign in with Google, we receive your name, email address, and
              profile photo to identify you and keep you signed in.
            </li>
            <li>
              <span className="font-semibold">Photos you upload</span> &mdash; the
              schedule images you choose to upload for extraction.
            </li>
            <li>
              <span className="font-semibold">Optional context you provide</span>
              &mdash; if you use the &ldquo;Shared schedule?&rdquo; option, whatever
              name, color, or detail you type in to help us identify your own shifts.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-[15px] font-bold">How we use your Google Calendar access</h2>
          <p>
            We request Google&rsquo;s <code className="text-[13px]">calendar.events</code>{" "}
            permission, which lets the App add events to your primary Google Calendar.
            We only ever add events &mdash; we never read, modify, or delete anything
            else on your calendar, and we don&rsquo;t access any other Google service or
            data. Events are only added after you&rsquo;ve reviewed and confirmed them;
            nothing is added automatically.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-[15px] font-bold">How we handle your photos</h2>
          <p>
            When you upload a photo, it&rsquo;s sent to Google&rsquo;s Gemini API to
            extract event details &mdash; dates, times, and titles. We don&rsquo;t
            store your photos after that request completes, and we don&rsquo;t use
            them for anything beyond generating the event list you review.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-[15px] font-bold">Data we store</h2>
          <p>
            To keep you signed in and remember your Google Calendar connection, we
            store your account ID, email address, and OAuth tokens in our database. We
            don&rsquo;t store the photos you upload or the events extracted from them
            beyond what you choose to add to your calendar.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-[15px] font-bold">Sharing</h2>
          <p>
            We don&rsquo;t sell your data, use it for advertising, or share it with
            third parties &mdash; other than the Google services (Sign-In, Calendar,
            and the Gemini API) required to run the App.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-[15px] font-bold">Your choices</h2>
          <p>
            You can revoke the App&rsquo;s access at any time from your{" "}
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noreferrer"
              className="font-semibold underline"
            >
              Google Account permissions
            </a>
            . You can also ask us to delete your stored account data by contacting us
            below.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-[15px] font-bold">Changes to this policy</h2>
          <p>
            We may update this policy as the App changes. We&rsquo;ll update the
            effective date above when we do.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-[15px] font-bold">Contact</h2>
          <p>
            Questions about this policy? Email{" "}
            <a href="mailto:9cguizar2004@gmail.com" className="font-semibold underline">
              9cguizar2004@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
