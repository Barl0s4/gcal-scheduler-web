"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Dropzone from "@/components/Dropzone";

export default function Home() {
  const { data: session, status } = useSession();

  // Fill in:
  // 1. if status === "loading", show something like "Loading..."

  if (status === 'loading') {
    return (
      <div>Loading...</div>
    );
  }
  // 2. if there's no session (not logged in), show a button that
  //    calls signIn("google") on click

  if (!session) {
    return (
      <div>
        <p>You are not signed in.</p>
        <button onClick={() => signIn("google")}>Sign in with Google</button>
      </div>
    );
  }
  // 3. if there IS a session, show session.user?.name or session.user?.email,
  //    a sign-out button that calls signOut() on click,
  //    and (for now, just a placeholder) where the dropzone will eventually go

  return (
    <div>
      <p>Signed in as {session.user?.name || session.user?.email}</p>
      <button onClick={() => signOut()}>Sign out</button>
      <div style={{ marginTop: '20px', padding: '10px', border: '1px dashed gray' }}>
        <Dropzone />
      </div>
    </div>
  );
}