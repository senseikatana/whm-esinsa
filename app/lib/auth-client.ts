"use client";

import { createAuthClient } from "better-auth/react";

/** Same-origin client: Next serves /api/auth on the same host. */
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
