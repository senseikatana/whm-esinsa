import type { UserProfile, UserRole } from "../../interfaces";

/**
 * Usuarios de ejemplo para el SGA.
 * NOTA: Estos usuarios deben crearse vía auth.signUp() o desde el dashboard de InsForge.
 * El seed solo perfiles, no cuentas de auth.
 */
export const SEED_USER_PROFILES: Omit<UserProfile, "id" | "created_at" | "updated_at">[] = [
	{
		email: "admin@esinsa.com",
		name: "Sergio Jurado",
		role: "admin",
		zone: "Oficina Central",
		phone: "+34 600 000 001",
		is_active: true,
	},
	{
		email: "gerente@esinsa.com",
		name: "Laura Martínez",
		role: "manager",
		zone: "Oficina",
		phone: "+34 600 000 002",
		is_active: true,
	},
	{
		email: "supervisor@esinsa.com",
		name: "Carlos Ruiz",
		role: "supervisor",
		zone: "Zona A",
		phone: "+34 600 000 003",
		is_active: true,
	},
	{
		email: "operario1@esinsa.com",
		name: "María López",
		role: "operator",
		zone: "Zona B",
		phone: "+34 600 000 004",
		is_active: true,
	},
	{
		email: "operario2@esinsa.com",
		name: "Ana García",
		role: "operator",
		zone: "Zona C",
		phone: "+34 600 000 005",
		is_active: true,
	},
	{
		email: "picker1@esinsa.com",
		name: "Pedro Sánchez",
		role: "picker",
		zone: "Zona A",
		phone: "+34 600 000 006",
		is_active: true,
	},
	{
		email: "picker2@esinsa.com",
		name: "Juan Torres",
		role: "picker",
		zone: "Zona B",
		phone: "+34 600 000 007",
		is_active: true,
	},
	{
		email: "viewer@esinsa.com",
		name: "Visitante Demo",
		role: "viewer",
		zone: "",
		phone: "",
		is_active: true,
	},
	{
		email: "inactivo@esinsa.com",
		name: "Usuario Inactivo",
		role: "operator",
		zone: "Zona D",
		phone: "+34 600 000 008",
		is_active: false,
	},
	{
		email: "jefa.turno@esinsa.com",
		name: "Natalia Romero",
		role: "manager",
		zone: "Zona D",
		phone: "+34 600 000 009",
		is_active: true,
	},
	{
		email: "supervisor2@esinsa.com",
		name: "Diego Navarro",
		role: "supervisor",
		zone: "Zona C",
		phone: "+34 600 000 010",
		is_active: true,
	},
	{
		email: "picker3@esinsa.com",
		name: "Sara Iglesias",
		role: "picker",
		zone: "Zona C",
		phone: "+34 600 000 011",
		is_active: true,
	},
];

/**
 * Permisos por rol para el SGA.
 */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
	admin: ["*"],
	manager: [
		"dashboard",
		"inventory",
		"orders",
		"picking",
		"routes",
		"whatsapp",
		"staff",
		"sap",
		"reports",
	],
	supervisor: ["dashboard", "inventory", "orders", "picking", "routes", "staff"],
	operator: ["dashboard", "inventory", "orders", "picking"],
	picker: ["dashboard", "picking"],
	viewer: ["dashboard"],
};

/**
 * Descripciones de roles para la UI.
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, { label: string; description: string }> = {
	admin: {
		label: "Administrador",
		description: "Acceso total al sistema, gestión de usuarios y configuración",
	},
	manager: {
		label: "Gerente",
		description: "Gestión operativa completa, reportes y análisis",
	},
	supervisor: {
		label: "Supervisor",
		description: "Supervisión de operaciones, personal y rutas",
	},
	operator: {
		label: "Operario",
		description: "Operaciones de almacén: inventario, recepciones y expediciones",
	},
	picker: {
		label: "Picker",
		description: "Tareas de picking y preparación de pedidos",
	},
	viewer: {
		label: "Visor",
		description: "Solo lectura del dashboard, sin permisos de edición",
	},
};
