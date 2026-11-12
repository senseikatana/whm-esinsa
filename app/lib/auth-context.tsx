"use client";

import { createContext, type ReactNode, useCallback, useContext, useMemo } from "react";
import type { AuthContextType, AuthUser } from "../interfaces";
import { authClient } from "./auth-client";

const AuthContext = createContext<AuthContextType>({
	user: null,
	loading: true,
	login: async () => ({ error: null }),
	register: async () => ({ error: null }),
	loginWithOAuth: async () => ({ error: null }),
	logout: async () => {},
});

/** Translates Better Auth error codes into Spanish messages. */
function translateAuthError(code: string | undefined, fallback: string | undefined): string {
	switch (code) {
		case "INVALID_EMAIL_OR_PASSWORD":
			return "Email o contraseña incorrectos";
		case "USER_ALREADY_EXISTS":
			return "Ya existe una cuenta con ese email";
		case "PASSWORD_TOO_SHORT":
			return "La contraseña debe tener al menos 6 caracteres";
		case "INVALID_EMAIL":
			return "El email no es válido";
		case "EMAIL_NOT_VERIFIED":
			return "Tenés que verificar tu email antes de ingresar";
		case "PROVIDER_NOT_FOUND":
			return "Ese proveedor de login no está configurado";
		default:
			return fallback || "No se pudo completar la operación";
	}
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const { data: session, isPending } = authClient.useSession();

	const user: AuthUser | null = useMemo(() => {
		if (!session?.user) return null;
		const extra = session.user as typeof session.user & { role?: string };
		return {
			id: session.user.id,
			email: session.user.email,
			name: session.user.name,
			role: (extra.role ?? "operator") as AuthUser["role"],
		};
	}, [session]);

	const login = useCallback(async (email: string, password: string) => {
		const { error } = await authClient.signIn.email({ email, password });
		if (error) {
			return { error: translateAuthError(error.code, error.message) };
		}
		return { error: null };
	}, []);

	const register = useCallback(async (email: string, password: string, name?: string) => {
		const { error } = await authClient.signUp.email({
			email,
			password,
			name: name?.trim() || email.split("@")[0],
		});
		if (error) {
			return { error: translateAuthError(error.code, error.message) };
		}
		return { error: null };
	}, []);

	const loginWithOAuth = useCallback(async (provider: "google" | "github") => {
		const { error } = await authClient.signIn.social({
			provider,
			callbackURL: typeof window !== "undefined" ? window.location.origin : "/",
		});
		if (error) {
			return { error: translateAuthError(error.code, error.message) };
		}
		return { error: null };
	}, []);

	const logout = useCallback(async () => {
		await authClient.signOut();
	}, []);

	return (
		<AuthContext.Provider
			value={{ user, loading: isPending, login, register, loginWithOAuth, logout }}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth(): AuthContextType {
	return useContext(AuthContext);
}
