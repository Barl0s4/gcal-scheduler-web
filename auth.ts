import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
    Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
        params: {
          // Fill this in based on what you already know from
          // your old googleAuth.js's getAuthUrl() function:
          // - what two params force Google to hand back a refresh_token?
          // - what scope string do you need for calendar write access,
          //   PLUS the standard "openid email profile" scopes Auth.js
          //   needs for login itself?
            access_type: "offline",
            prompt: "consent",
            scope: "openid email profile https://www.googleapis.com/auth/calendar.events",
        },
        },
    }),
    ],
});