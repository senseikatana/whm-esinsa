import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { authOptions, configuredProviders } from "./auth-options";

export const auth = betterAuth({
	...authOptions(),
	plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
export type AuthUser = AuthSession["user"];

export { configuredProviders };
