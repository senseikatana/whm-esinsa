"use client";

import { Bot, Loader2, Route as RouteIcon, Sparkles } from "lucide-react";
import { useState } from "react";

// local call helper (DeepSeek)
const callAILocal = async (prompt: string) => {
	const apiKey = typeof window !== "undefined" ? localStorage.getItem("ai_api_key") || "" : "";
	if (!apiKey) {
		await new Promise((res) => setTimeout(res, 800));
		return "Ruta Inteligente Generada (Mock):\n1. Empieza en el Muelle de Recepción A.\n2. Recoge SKU-001 en A-01-01.\n3. Muévete al Pasillo B y recoge SKU-003 en B-05-02.\n4. Lleva el carro al área de empaque C.\n\nEsta secuencia optimiza el recorrido reduciendo el tránsito en un 28% comparado con discrete picking.";
	}
	const url = "https://api.deepseek.com/v1/chat/completions";
	const payload = {
		model: "deepseek-chat",
		messages: [
			{
				role: "system",
				content: "Eres un planificador de rutas logísticas y experto SGA de WarehouseFlow.",
			},
			{ role: "user", content: prompt },
		],
		temperature: 0.7,
		max_tokens: 1024,
	};
	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify(payload),
		});
		const data = await response.json();
		return data.choices?.[0]?.message?.content || "No se pudo obtener la sugerencia.";
	} catch (_err) {
		return "Error al comunicar con la IA.";
	}
};

export default function RoutesView() {
	const [optimizedText, setOptimizedText] = useState<string>("");
	const [loadingRoute, setLoadingRoute] = useState(false);

	const handleOptimizeRoute = async () => {
		setLoadingRoute(true);
		const text = await callAILocal(
			"Dime la ruta más optimizada para recoger productos ubicados en los pasillos A, B y C. Formato paso a paso de directivas cortas de almacén.",
		);
		setOptimizedText(text);
		setLoadingRoute(false);
	};

	return (
		<div className="bg-[#0b0f19] border border-slate-800 p-6 rounded-2xl space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h2 className="text-lg font-black text-white flex items-center gap-2">
						<RouteIcon className="text-indigo-400" aria-hidden="true" /> Planificador de Rutas de Almacén
					</h2>
					<p className="text-xs text-slate-400">
						Cálculo inteligente de rutas internas para minimizar distancias de picking
					</p>
				</div>
				<button
					onClick={handleOptimizeRoute}
					disabled={loadingRoute}
					className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
					type="button"
				>
					{loadingRoute ? (
						<Loader2 className="animate-spin" size={14} aria-hidden="true" />
					) : (
						<Bot size={14} aria-hidden="true" />
					)}{" "}
					Optimizar con IA
				</button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Visual Map */}
				<div className="lg:col-span-2 bg-[#050811] border border-slate-800 p-6 rounded-xl relative transition-colors duration-200 hover:border-slate-700">
					<p className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">
						Mapa del Almacén
					</p>
					<div className="grid grid-cols-4 gap-4 h-64 border border-slate-800/80 rounded-xl p-4 bg-[#050811]/60 relative">
						<div className="absolute top-2 left-2 px-2 py-0.5 bg-indigo-900 text-indigo-300 border border-indigo-700 rounded text-[9px] font-bold">
							Muelles A, B, C
						</div>

						{/* Zones Grid */}
						{["Zona Recepción (A)", "Zona Estanterías (B)", "Zona Frío (D)", "Zona Despacho (C)"].map(
							(zone, idx) => (
								<div
									key={idx}
									className="border border-slate-800 bg-[#0b0f19]/60 rounded-xl p-3 flex flex-col justify-between items-center text-center"
								>
									<span className="text-[10px] font-bold text-slate-400">{zone}</span>
									<div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-indigo-400 border border-slate-700">
										{["A", "B", "D", "C"][idx]}
									</div>
								</div>
							),
						)}
					</div>
				</div>

				{/* Optimization results */}
				<div className="bg-[#050811] border border-slate-800 p-5 rounded-xl flex flex-col transition-colors duration-200 hover:border-slate-700">
					<h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1">
						<Sparkles size={14} className="text-indigo-400" aria-hidden="true" /> Ruta Recomendada
					</h3>
					<div
						className="flex-1 overflow-y-auto max-h-56 pr-1 text-xs text-slate-300 font-semibold space-y-3"
						aria-live="polite"
					>
						{optimizedText ? (
							<p className="leading-relaxed bg-[#0b0f19] p-4 rounded-xl border border-slate-800">
								{optimizedText}
							</p>
						) : (
							<div className="flex flex-col items-center justify-center text-center py-6">
								<RouteIcon size={24} className="text-slate-600 mb-2" aria-hidden="true" />
								<p className="text-sm font-semibold text-slate-300">Sin ruta calculada</p>
								<p className="text-xs text-slate-500 mt-1 italic">
									Haz clic en "Optimizar con IA" para recibir instrucciones optimizadas basadas en la carga
									de trabajo actual.
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
