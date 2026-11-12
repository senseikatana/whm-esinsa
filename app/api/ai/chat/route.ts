import { NextResponse } from "next/server";
import { getSessionUser, withAuth } from "../../../lib/api-auth";
import { rateLimit } from "../../../lib/rate-limit";

const MAX_MESSAGES = 24;
const MAX_TOTAL_CHARS = 24_000;
const MAX_OUTPUT_TOKENS = 2_048;
const REQUEST_TIMEOUT_MS = 60_000;

type Role = "system" | "user" | "assistant";

interface ChatMessage {
	role: Role;
	content: string;
}

function isMessage(value: unknown): value is ChatMessage {
	if (!value || typeof value !== "object") return false;
	const message = value as Record<string, unknown>;
	return (
		(message.role === "system" || message.role === "user" || message.role === "assistant") &&
		typeof message.content === "string"
	);
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

export const POST = withAuth(async (request: Request) => {
	const user = await getSessionUser();
	if (!user) {
		return NextResponse.json({ success: false, error: "Sesión requerida" }, { status: 401 });
	}

	if (!rateLimit(`ai:${user.id}`, 20)) {
		return NextResponse.json(
			{ success: false, error: "Demasiadas consultas a la IA. Probá en un minuto." },
			{ status: 429 },
		);
	}

	const apiKey = process.env.FREELLM_GATEWAY_KEY;
	const baseUrl = (process.env.FREELLM_GATEWAY_URL || "http://127.0.0.1:31415/v1").replace(
		/\/+$/,
		"",
	);

	if (!apiKey) {
		return NextResponse.json(
			{
				success: false,
				error: "FreeLLMAPI no está configurado en el servidor.",
				code: "AI_NOT_CONFIGURED",
			},
			{ status: 503 },
		);
	}

	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ success: false, error: "JSON inválido" }, { status: 400 });
	}

	const messages = Array.isArray(body.messages) ? body.messages.filter(isMessage) : [];
	if (messages.length === 0) {
		return NextResponse.json({ success: false, error: "Faltan mensajes" }, { status: 400 });
	}
	if (messages.length > MAX_MESSAGES) {
		return NextResponse.json({ success: false, error: "Demasiados mensajes" }, { status: 413 });
	}

	const totalChars = messages.reduce((sum, message) => sum + message.content.length, 0);
	if (totalChars > MAX_TOTAL_CHARS) {
		return NextResponse.json(
			{ success: false, error: "El prompt es demasiado largo" },
			{ status: 413 },
		);
	}

	const model =
		typeof body.model === "string" && body.model.trim() ? body.model.trim().slice(0, 100) : "auto";
	const temperature =
		typeof body.temperature === "number" && Number.isFinite(body.temperature)
			? clamp(body.temperature, 0, 2)
			: 0.7;
	const maxTokens =
		typeof body.max_tokens === "number" && Number.isFinite(body.max_tokens)
			? Math.trunc(clamp(body.max_tokens, 1, MAX_OUTPUT_TOKENS))
			: 1_024;

	try {
		const response = await fetch(`${baseUrl}/chat/completions`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
		});

		if (!response.ok) {
			const detail = await response.text().catch(() => "");
			console.error(`[ai] FreeLLMAPI ${response.status}: ${detail.slice(0, 500)}`);

			if (response.status === 401 || response.status === 403) {
				return NextResponse.json(
					{ success: false, error: "FreeLLMAPI rechazó la credencial configurada." },
					{ status: 502 },
				);
			}
			if (response.status === 429) {
				return NextResponse.json(
					{ success: false, error: "FreeLLMAPI alcanzó su límite de uso. Reintentá luego." },
					{ status: 429 },
				);
			}
			return NextResponse.json(
				{ success: false, error: "FreeLLMAPI no pudo completar la solicitud." },
				{ status: 502 },
			);
		}

		const data = (await response.json()) as {
			model?: string;
			choices?: { message?: { content?: string } }[];
		};

		return NextResponse.json({
			success: true,
			content: data.choices?.[0]?.message?.content ?? "",
			model: data.model ?? model,
		});
	} catch (error) {
		console.error("[ai] FreeLLMAPI request failed", error);
		return NextResponse.json(
			{ success: false, error: "No se pudo conectar con FreeLLMAPI." },
			{ status: 502 },
		);
	}
});
