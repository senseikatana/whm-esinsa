"use client";

import { LayoutDashboard, ListChecks, Loader2, Package, QrCode } from "lucide-react";
import type React from "react";
import { useState } from "react";
import type { MobileAppSimulatorProps } from "../interfaces";

const getStatusColor = (status: string) => {
	const greenStatuses = [
		"OK",
		"Activo",
		"Completado",
		"Disponible",
		"Activa",
		"Completada",
		"Recibido",
		"Despachado",
	];
	const orangeStatuses = [
		"Bajo",
		"Pendiente",
		"En Proceso",
		"En Ruta",
		"Empacando",
		"Picking",
		"Packing",
		"Control de Calidad",
	];
	const redStatuses = ["Crítico", "Inactivo", "Mantenimiento", "Cancelado", "Pausada", "warning"];

	if (greenStatuses.includes(status))
		return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
	if (orangeStatuses.includes(status))
		return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
	if (redStatuses.includes(status)) return "bg-rose-500/20 text-rose-400 border border-rose-500/30";
	return "bg-slate-800 text-slate-400 border border-slate-700/50";
};

export default function MobileAppSimulator({ dbState }: MobileAppSimulatorProps) {
	const [tab, setTab] = useState<"home" | "scan" | "picking" | "inventory">("home");
	const [scanInput, setScanInput] = useState("");
	const [scanResult, setScanResult] = useState<string | null>(null);
	const [scanning, setScanning] = useState(false);

	const handleManualScanSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!scanInput) return;
		setScanning(true);

		// Local scan (no backend scan endpoint)
		// Simulate delay
		await new Promise((res) => setTimeout(res, 800));
		const matched = dbState.products.find((p: any) => p.sku === scanInput);
		if (matched) {
			setScanResult(
				`Localizado: ${matched.name}. Stock: ${matched.stock}. Ubicacion: ${matched.location}`,
			);
		} else {
			setScanResult(`Error: SKU ${scanInput} no encontrado en base de datos.`);
		}
		setScanning(false);
	};

	return (
		<div className="flex-1 flex flex-col justify-between text-slate-100 font-semibold p-4 relative">
			{/* Dynamic Screen View */}
			<div className="flex-1 overflow-y-auto mb-16 space-y-4">
				{tab === "home" && (
					<div className="space-y-4">
						<div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-3xl p-5 text-white shadow-xl">
							<h3 className="text-xl font-black mb-0.5">Hola Carlos</h3>
							<p className="text-xs text-indigo-200 font-semibold">Turno Mañana · Zona B</p>

							<div className="grid grid-cols-2 gap-3 mt-5">
								<div className="bg-white/10 rounded-2xl p-3.5 backdrop-blur-md">
									<h4 className="text-2xl font-black text-white">
										{dbState.picking.filter((t: any) => t.status === "Pendiente").length}
									</h4>
									<p className="text-[10px] text-indigo-200 uppercase font-bold mt-1">Pickings Pdtes</p>
								</div>
								<div className="bg-white/10 rounded-2xl p-3.5 backdrop-blur-md">
									<h4 className="text-2xl font-black text-white">{dbState.products.length}</h4>
									<p className="text-[10px] text-indigo-200 uppercase font-bold mt-1">SKUs Activos</p>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<button
								type="button"
								onClick={() => setTab("scan")}
								className="bg-[#050811] p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center gap-2"
							>
								<QrCode className="text-indigo-400" size={24} />
								<span className="text-xs">Escanear SKU</span>
							</button>
							<button
								type="button"
								onClick={() => setTab("picking")}
								className="bg-[#050811] p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center gap-2"
							>
								<ListChecks className="text-amber-400" size={24} />
								<span className="text-xs">Tareas Picking</span>
							</button>
						</div>
					</div>
				)}

				{tab === "scan" && (
					<div className="space-y-4 p-1">
						<h3 className="text-sm font-bold text-white flex items-center gap-1.5">
							<QrCode size={18} className="text-indigo-400" /> Escáner de Código de Barras
						</h3>
						<form onSubmit={handleManualScanSubmit} className="space-y-3.5">
							<input
								type="text"
								placeholder="Escanea o escribe SKU (ej. SKU-001)"
								value={scanInput}
								onChange={(e) => setScanInput(e.target.value)}
								className="w-full bg-[#050811] border border-slate-800 rounded-xl p-3.5 text-sm outline-none text-slate-100 placeholder-slate-650 focus:border-indigo-500 font-bold"
							/>
							<button
								type="submit"
								disabled={scanning}
								className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
							>
								{scanning ? <Loader2 className="animate-spin" size={14} /> : null} Registrar Escaneo
							</button>
						</form>

						{scanResult && (
							<div className="bg-[#050811] border border-slate-800 p-4 rounded-xl text-xs text-slate-300 leading-relaxed font-bold">
								{scanResult}
							</div>
						)}
					</div>
				)}

				{tab === "picking" && (
					<div className="space-y-3 p-1">
						<h3 className="text-sm font-bold text-white flex items-center gap-1.5">
							<ListChecks size={18} className="text-indigo-400" /> Picking Móvil
						</h3>
						{dbState.picking.map((item: any) => (
							<div
								key={item.id}
								className="p-4 bg-[#050811] border border-slate-800 rounded-2xl space-y-2"
							>
								<div className="flex justify-between items-center">
									<span className="font-extrabold text-xs text-slate-200">{item.taskNumber}</span>
									<span
										className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}
									>
										{item.status}
									</span>
								</div>
								<p className="text-[10px] text-slate-400">Orden de salida: {item.orderNumber}</p>
								<div className="flex justify-between items-center text-xs mt-2 border-t border-slate-900 pt-2 text-slate-350">
									<span>Cant: {item.totalItems} items</span>
									<span className="text-[10px] text-indigo-400 font-bold">Zona: {item.zone}</span>
								</div>
							</div>
						))}
					</div>
				)}

				{tab === "inventory" && (
					<div className="space-y-3.5 p-1">
						<h3 className="text-sm font-bold text-white flex items-center gap-1.5">
							<Package size={18} className="text-indigo-400" /> Consulta Stock
						</h3>
						<div className="space-y-2 max-h-[480px] overflow-y-auto">
							{dbState.products.map((p: any) => (
								<div
									key={p.id}
									className="p-3 bg-[#050811] border border-slate-800 rounded-xl flex justify-between items-center"
								>
									<div>
										<p className="text-xs font-bold text-slate-200">{p.name}</p>
										<p className="text-[10px] text-slate-500">
											SKU: {p.sku} | Loc: <span className="text-indigo-400 font-semibold">{p.location}</span>
										</p>
									</div>
									<span
										className={`text-xs font-bold px-2 py-1 rounded bg-[#0b0f19] border border-slate-800 ${p.stock <= p.minStock ? "text-rose-450" : "text-slate-300"}`}
									>
										Stock: {p.stock}
									</span>
								</div>
							))}
						</div>
					</div>
				)}
			</div>

			{/* PDA Bottom Screen Navigation Bar */}
			<nav className="absolute bottom-0 left-0 right-0 h-16 bg-[#050811] border-t border-slate-800 flex justify-around items-center px-2 z-10">
				<button
					onClick={() => setTab("home")}
					className={`flex flex-col items-center ${tab === "home" ? "text-indigo-400" : "text-slate-500"}`}
					type="button"
				>
					<LayoutDashboard size={18} />
					<span className="text-[9px] mt-0.5">Inicio</span>
				</button>
				<button
					onClick={() => setTab("scan")}
					className="bg-indigo-600 text-white p-3 rounded-full -mt-6 shadow-lg shadow-indigo-600/30"
					type="button"
				>
					<QrCode size={18} />
				</button>
				<button
					onClick={() => setTab("inventory")}
					className={`flex flex-col items-center ${tab === "inventory" ? "text-indigo-400" : "text-slate-500"}`}
					type="button"
				>
					<Package size={18} />
					<span className="text-[9px] mt-0.5">Stock</span>
				</button>
			</nav>
		</div>
	);
}
