"use client";

import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import type { AuthContextType, AuthUser } from "../interfaces";
import { getCurrentUser, signIn, signInWithOAuth, signOut, signUp } from "./auth";

const AuthContext = createContext<AuthContextType>({
	user: null,
	loading: false,
	login: async () => ({ error: null }),
	register: async () => ({ error: null }),
	loginWithOAuth: async () => ({ error: null }),
	logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getCurrentUser()
			.then((u) => {
				setUser(u);
			})
			.catch(() => {
				setUser(null);
			})
			.finally(() => {
				setLoading(false);
			});
	}, []);

	const login = async (email: string, password: string) => {
		try {
			const result = await signIn(email, password);
			if (result.user) setUser(result.user);
			return { error: result.error };
		} catch {
			return { error: "Error de conexión" };
		}
	};

	const register = async (email: string, password: string, name?: string) => {
		try {
			const result = await signUp(email, password, name);
			if (result.user) setUser(result.user);
			return { error: result.error };
		} catch {
			return { error: "Error de conexión" };
		}
	};

	const loginWithOAuth = async (provider: "google" | "github") => {
		try {
			return await signInWithOAuth(provider);
		} catch {
			return { error: "Error de conexión" };
		}
	};

	const logout = async () => {
		try {
			await signOut();
		} finally {
			setUser(null);
		}
	};

	return (
		<AuthContext.Provider value={{ user, loading, login, register, loginWithOAuth, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth(): AuthContextType {
	return useContext(AuthContext);
}
