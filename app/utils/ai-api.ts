const DEFAULT_SYSTEM_INSTRUCTION =
	"Eres el consultor logístico y asistente experto AI de WarehouseFlow. Tus respuestas deben ser sumamente profesionales, concisas y directas.";

/**
 * Calls the server-side FreeLLMAPI proxy.
 * The browser never sees the gateway key.
 *
 * When the server has no FreeLLMAPI credentials (or the gateway is down), it
 * falls back to the local demo response so the rest of the SGA stays usable.
 */
export async function callAI(
	prompt: string,
	systemInstruction: string = DEFAULT_SYSTEM_INSTRUCTION,
	fallback?: string,
): Promise<string> {
	try {
		const response = await fetch("/api/ai/chat", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				messages: [
					{ role: "system", content: systemInstruction },
					{ role: "user", content: prompt },
				],
				model: "auto",
				temperature: 0.7,
				max_tokens: 2_048,
			}),
		});

		const data = await response.json().catch(() => null);

		if (response.status === 503 && data?.code === "AI_NOT_CONFIGURED") {
			return fallback ?? getMockResponse(prompt);
		}

		if (!response.ok || !data?.success) {
			console.error("FreeLLMAPI error:", data?.error ?? response.status);
			return fallback ?? data?.error ?? "Error al comunicar con FreeLLMAPI.";
		}

		return data.content || fallback || "Sin respuesta del modelo.";
	} catch (error) {
		console.error("FreeLLMAPI request failed:", error);
		return fallback ?? "Error al comunicar con FreeLLMAPI.";
	}
}

// Backward compatibility alias used by older screens.
export const callGeminiAPI = callAI;

/**
 * Local demo responses used when FreeLLMAPI is not configured.
 */
function getMockResponse(prompt: string): string {
	const lower = prompt.toLowerCase();

	if (lower.includes("json")) {
		if (lower.includes("inventory") || lower.includes("products")) {
			return JSON.stringify({
				sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
				name: "Producto IA Generado",
				category: "Almacenaje",
				stock: 120,
				minStock: 20,
				location: "A-05-01",
				price: 45.0,
			});
		}
		if (lower.includes("crm") || lower.includes("cliente")) {
			return JSON.stringify({
				code: `CUST0${Math.floor(10 + Math.random() * 90)}`,
				name: "Empresa Logística IA",
				type: "Cliente",
				email: "ia@empresalogistica.com",
				phone: "+34 600 000 000",
				status: "Activo",
			});
		}
		if (lower.includes("order") || lower.includes("orden")) {
			return JSON.stringify({
				orderNumber: `PED-2026-${Math.floor(100 + Math.random() * 900)}`,
				customerName: "Mercadona S.A.",
				status: "Pendiente",
				priority: "normal",
				totalItems: 6,
				totalValue: 850.0,
			});
		}
		return JSON.stringify({ ok: true });
	}

	if (lower.includes("ruta")) {
		return "Optimización IA sugerida: La ruta más corta para picking es de Dock A -> Pasillo A-02 -> Rack Level 3 -> Consolidador A. Esto ahorra un 22% de tiempo de recorrido.";
	}

	if (lower.includes("whatsapp")) {
		return "Hola, sí. Su pedido ya está listo para despacho en el Muelle de Carga C. Puede ingresar con el camión ahora.";
	}

	return "Simulación de Asistente IA de WarehouseFlow: Se sugiere optimizar la ubicación de la categoría Palets debido a una alta tasa de rotación (Clase A).";
}
