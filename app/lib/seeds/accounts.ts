import type { UserRole } from "../../interfaces";

export interface SeedAccount {
	email: string;
	password: string;
	name: string;
	role: UserRole;
	zone: string;
	phone: string;
}

/**
 * Demo accounts created by `bun run db:seed`.
 * Keep in sync with the credentials shown on the login screen.
 */
export const SEED_ACCOUNTS: SeedAccount[] = [
	{
		email: "admin@esinsa.com",
		password: "admin123",
		name: "Sergio Jurado",
		role: "admin",
		zone: "Oficina Central",
		phone: "+34 600 000 001",
	},
	{
		email: "gerente@esinsa.com",
		password: "gerente123",
		name: "Laura Martínez",
		role: "manager",
		zone: "Oficina",
		phone: "+34 600 000 002",
	},
	{
		email: "supervisor@esinsa.com",
		password: "super123",
		name: "Carlos Ruiz",
		role: "supervisor",
		zone: "Zona A",
		phone: "+34 600 000 003",
	},
	{
		email: "operario1@esinsa.com",
		password: "opera123",
		name: "María López",
		role: "operator",
		zone: "Zona B",
		phone: "+34 600 000 004",
	},
	{
		email: "picker1@esinsa.com",
		password: "picker123",
		name: "Pedro Sánchez",
		role: "picker",
		zone: "Zona A",
		phone: "+34 600 000 006",
	},
	{
		email: "viewer@esinsa.com",
		password: "viewer123",
		name: "Visitante Demo",
		role: "viewer",
		zone: "",
		phone: "",
	},
];
