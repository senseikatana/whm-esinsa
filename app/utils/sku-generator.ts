/**
 * Generates a SKU code from a category and product name.
 * Format: CAT-XX-NNNN (e.g., "PA-ET-1234")
 */
export function generateSKU(category?: string, name?: string): string {
	const catPrefix = category ? category.substring(0, 3).toUpperCase() : "GEN";
	const namePrefix = name ? name.substring(0, 2).toUpperCase() : "XX";
	const randomNum = Math.floor(1000 + Math.random() * 9000);
	return `${catPrefix}-${namePrefix}-${randomNum}`;
}
