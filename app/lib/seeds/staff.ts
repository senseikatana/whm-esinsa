import type { Staff } from "../../interfaces";

export const SEED_STAFF: Omit<Staff, "id" | "slug" | "created_at" | "updated_at">[] = [
	{ name: "Juan García", role: "Administrador", zone: "Oficina", status: "Activo" },
	{ name: "María López", role: "Operario", zone: "Zona B", status: "En Ruta" },
	{ name: "Carlos Ruiz", role: "Operario", zone: "Zona A", status: "Activo" },
	{ name: "Ana Martínez", role: "Operario", zone: "Zona C", status: "Inactivo" },
	{ name: "Sergio Jurado", role: "Supervisor", zone: "Oficina", status: "Activo" },
	{ name: "Laura Martínez", role: "Administrador", zone: "Oficina", status: "Activo" },
	{ name: "Pedro Sánchez", role: "Picker", zone: "Zona A", status: "Activo" },
	{ name: "Juan Torres", role: "Picker", zone: "Zona B", status: "Activo" },
	{ name: "Lucía Fernández", role: "Picker", zone: "Zona C", status: "Activo" },
	{ name: "David Moreno", role: "Operario", zone: "Zona D", status: "Activo" },
	{ name: "Marta Vidal", role: "Operario", zone: "Taller Corte", status: "Activo" },
	{ name: "Javier Ortega", role: "Operario", zone: "Muelles", status: "En Ruta" },
	{ name: "Andrés Molina", role: "Mantenimiento", zone: "Taller Corte", status: "Activo" },
];
