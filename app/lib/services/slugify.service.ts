/**
 * Genera un slug SEO-friendly a partir de un texto.
 * Ej: "Palet Europeo 120x80" → "palet-europeo-120x80"
 */
export function slugify(text: string): string {
	return text
		.toString()
		.toLowerCase()
		.trim()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/[\s_]+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-+|-+$/g, "");
}

/**
 * Genera un slug único añadiendo un sufijo corto.
 * Ej: "palet-europeo" → "palet-europeo-a3f2"
 */
export function uniqueSlug(text: string): string {
	const base = slugify(text);
	const suffix = Math.random().toString(36).substring(2, 6);
	return `${base}-${suffix}`;
}

/**
 * Genera un SKU slug para productos.
 * Ej: { category: "Palets", name: "Europeo 120x80" } → "pal-eur-1234"
 */
export function productSlug(category: string, name: string): string {
	const catPart = slugify(category).substring(0, 3);
	const namePart = slugify(name).substring(0, 3);
	const num = Math.floor(1000 + Math.random() * 9000);
	return `${catPart}-${namePart}-${num}`;
}

/**
 * Genera un slug para órdenes.
 * Ej: { type: "PED", customer: "Mercadona" } → "ped-mercadona-20260901"
 */
export function orderSlug(type: string, customer: string): string {
	const typePart = slugify(type).substring(0, 3);
	const customerPart = slugify(customer).substring(0, 8);
	const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
	return `${typePart}-${customerPart}-${date}`;
}

/**
 * Valida si un string es un slug válido.
 */
export function isValidSlug(slug: string): boolean {
	return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
