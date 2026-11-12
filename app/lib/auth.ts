import type { AuthResult, AuthUser } from "../interfaces";
import insforge from "./insforge";

export type { AuthResult, AuthUser } from "../interfaces";

/**
 * Sign up with email and password.
 */
export async function signUp(email: string, password: string, name?: string): Promise<AuthResult> {
	try {
		const { data, error } = await insforge.auth.signUp({
			email,
			password,
			name,
		});

		if (error) return { user: null, error: error.message };

		if (data?.requireEmailVerification) {
			return { user: null, error: null };
		}

		if (data?.user) {
			return {
				user: {
					id: data.user.id,
					email: data.user.email,
					name: data.user.profile?.name,
				},
				error: null,
			};
		}

		return { user: null, error: null };
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Error during sign up";
		return { user: null, error: message };
	}
}

/**
 * Sign in with email and password.
 */
export async function signIn(email: string, password: string): Promise<AuthResult> {
	try {
		const { data, error } = await insforge.auth.signInWithPassword({
			email,
			password,
		});

		if (error) return { user: null, error: error.message };

		if (data?.user) {
			return {
				user: {
					id: data.user.id,
					email: data.user.email,
					name: data.user.profile?.name,
				},
				error: null,
			};
		}

		return { user: null, error: "No user returned" };
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Error during sign in";
		return { user: null, error: message };
	}
}

/**
 * Sign in with OAuth provider (Google, GitHub).
 */
export async function signInWithOAuth(
	provider: "google" | "github",
): Promise<{ error: string | null }> {
	try {
		const redirectTo = typeof window !== "undefined" ? window.location.origin : "";
		const { error } = await insforge.auth.signInWithOAuth({
			provider,
			redirectTo,
		});

		if (error) return { error: error.message };
		return { error: null };
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : `Error signing in with ${provider}`;
		return { error: message };
	}
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<{ error: string | null }> {
	try {
		const { error } = await insforge.auth.signOut();
		if (error) return { error: error.message };
		return { error: null };
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Error during sign out";
		return { error: message };
	}
}

/**
 * Get the current authenticated user.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
	try {
		const { data, error } = await insforge.auth.getCurrentUser();
		if (error || !data?.user) return null;

		return {
			id: data.user.id,
			email: data.user.email,
			name: data.user.profile?.name,
		};
	} catch {
		return null;
	}
}

/**
 * Resend verification email.
 */
export async function resendVerification(email: string): Promise<{ error: string | null }> {
	try {
		await insforge.auth.resendVerificationEmail({ email });
		return { error: null };
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Error resending verification";
		return { error: message };
	}
}
