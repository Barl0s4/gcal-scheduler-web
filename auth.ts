import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    // Together these force Google to return a refresh_token,
                    // which lets us write to the calendar on a later request
                    // without the user having to re-authorize.
                    access_type: "offline",
                    prompt: "consent",

                    // calendar.events grants write access to the user's events;
                    // openid/email/profile are what Auth.js needs to sign them in.
                    scope: "openid email profile https://www.googleapis.com/auth/calendar.events",
                },
            },
        }),
    ],
});
