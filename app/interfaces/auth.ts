// ==================== Auth ====================
export interface AuthUser {
	id: string;
	email: string;
	name?: string;
}

export interface AuthResult {
	user: AuthUser | null;
	error: string | null;
}

export interface AuthContextType {
	user: AuthUser | null;
	loading: boolean;
	login: (email: string, password: string) => Promise<{ error: string | null }>;
	register: (email: string, password: string, name?: string) => Promise<{ error: string | null }>;
	loginWithOAuth: (provider: "google" | "github") => Promise<{ error: string | null }>;
	logout: () => Promise<void>;
}
