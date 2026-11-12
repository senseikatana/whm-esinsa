"use client";

import {
	AlertTriangle,
	ArrowDownToLine,
	CheckCircle2,
	Database,
	Package,
	Send,
	Truck,
	Users,
} from "lucide-react";
import { useMemo } from "react";
import type { DesktopDashboardViewProps } from "../interfaces";
import KpiCard from "./KpiCard";

export default function DesktopDashboardView({
	dbState,
	filteredIn,
	filteredOut,
	t,
}: DesktopDashboardViewProps) {
	const hasData =
		dbState.products.length > 0 || dbState.orders.length > 0 || dbState.picking.length > 0;

	const criticalStock = useMemo(
		() => dbState.products.filter((p: any) => p.stock <= p.minStock).length,
		[dbState.products],
	);

	const pendingOut = useMemo(
		() => filteredOut.filter((o: any) => o.status !== "Completado").length,
		[filteredOut],
	);

	return (
		<div className="space-y-6">
			{/* KPI Section */}
			<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
				<KpiCard
					title={t.compRate}
					value={hasData ? "98.4%" : "—"}
					subtitle={hasData ? "vs 96.2% el mes anterior" : "Sin datos"}
					icon={CheckCircle2}
					trend={hasData ? "+2.2%" : undefined}
					trendUp={true}
				/>
				<KpiCard
					title={t.inToday}
					value={filteredIn.length}
					subtitle={hasData ? "Muelles de descarga activos" : "Sin recepciones"}
					icon={ArrowDownToLine}
				/>
				<KpiCard
					title={t.pendingDisp}
					value={pendingOut}
					subtitle={hasData ? "En cola de expedición" : "Sin expediciones"}
					icon={Send}
				/>
				<KpiCard
					title={t.lowStock}
					value={criticalStock}
					subtitle={hasData ? "Artículos bajo stock mínimo" : "Sin inventario"}
					icon={AlertTriangle}
					trend={hasData ? (criticalStock > 0 ? "Crítico" : "Óptimo") : undefined}
					trendUp={criticalStock === 0}
				/>
			</div>

			{/* Empty state or content */}
			{!hasData ? (
				<div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
					<div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4">
						<Database size={32} className="text-slate-500" aria-hidden="true" />
					</div>
					<h3 className="text-lg font-bold text-white mb-2">Sin datos disponibles</h3>
					<p className="text-sm text-slate-400 max-w-md mb-6">
						Conecta tu base de datos InsForge o genera datos mock en cada módulo para comenzar a ver el
						dashboard operativo.
					</p>
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
						<div className="flex flex-col items-center gap-2 p-4 bg-[#050811] rounded-xl border border-slate-800">
							<Package size={20} className="text-slate-500" aria-hidden="true" />
							<span className="text-[10px] font-bold text-slate-500 uppercase">Inventario</span>
							<span className="text-lg font-black text-slate-600 tabular-nums">0</span>
						</div>
						<div className="flex flex-col items-center gap-2 p-4 bg-[#050811] rounded-xl border border-slate-800">
							<Truck size={20} className="text-slate-500" aria-hidden="true" />
							<span className="text-[10px] font-bold text-slate-500 uppercase">Órdenes</span>
							<span className="text-lg font-black text-slate-600 tabular-nums">0</span>
						</div>
						<div className="flex flex-col items-center gap-2 p-4 bg-[#050811] rounded-xl border border-slate-800">
							<Users size={20} className="text-slate-500" aria-hidden="true" />
							<span className="text-[10px] font-bold text-slate-500 uppercase">Personal</span>
							<span className="text-lg font-black text-slate-600 tabular-nums">0</span>
						</div>
						<div className="flex flex-col items-center gap-2 p-4 bg-[#050811] rounded-xl border border-slate-800">
							<AlertTriangle size={20} className="text-slate-500" aria-hidden="true" />
							<span className="text-[10px] font-bold text-slate-500 uppercase">Alertas</span>
							<span className="text-lg font-black text-slate-600 tabular-nums">0</span>
						</div>
					</div>
				</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Activity Volume Chart */}
					<div className="bg-[#0b0f19] border border-slate-800 p-5 rounded-2xl lg:col-span-2 flex flex-col justify-between transition-colors duration-200 hover:border-slate-700">
						<div className="flex justify-between items-center mb-4">
							<div>
								<h3 className="text-sm font-semibold text-slate-300">Volumen de Movimiento Diario</h3>
								<p className="text-xs text-slate-500">Entradas vs Salidas de palets</p>
							</div>
							<span className="text-[10px] font-bold px-2 py-1 bg-indigo-950 text-indigo-300 rounded border border-indigo-900">
								Últimos 7 días
							</span>
						</div>

						<div className="h-44 flex items-end justify-between px-2 pb-2 border-b border-slate-800">
							{["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day, idx) => {
								const val1 = [40, 55, 65, 80, 45, 20, 15][idx];
								const val2 = [30, 45, 75, 60, 50, 25, 10][idx];
								return (
									<div key={idx} className="flex flex-col items-center flex-1 space-y-2">
										<div className="w-full flex justify-center space-x-1.5 items-end h-36">
											<div
												style={{ height: `${val1}%` }}
												className="w-2.5 bg-indigo-500 rounded-t-xs"
												title={`Entradas: ${val1}`}
											/>
											<div
												style={{ height: `${val2}%` }}
												className="w-2.5 bg-indigo-300/40 rounded-t-xs"
												title={`Salidas: ${val2}`}
											/>
										</div>
										<span className="text-[10px] text-slate-500 font-bold">{day}</span>
									</div>
								);
							})}
						</div>
						<div className="flex space-x-4 mt-3 text-xs justify-center font-medium">
							<span className="flex items-center gap-1.5 text-indigo-400">
								<span className="w-2 h-2 rounded-full bg-indigo-500" />
								Entradas
							</span>
							<span className="flex items-center gap-1.5 text-slate-400">
								<span className="w-2 h-2 rounded-full bg-indigo-300/40" />
								Salidas
							</span>
						</div>
					</div>

					{/* Live Feed Logs */}
					<div className="bg-[#0b0f19] border border-slate-800 p-5 rounded-2xl flex flex-col transition-colors duration-200 hover:border-slate-700">
						<h3 className="text-sm font-semibold text-slate-300 mb-4">Registro Operativo de Almacén</h3>
						<div className="flex-1 overflow-y-auto space-y-3.5 max-h-56 pr-2">
							{[
								{
									time: "16:25",
									task: "Luis confirmó picking SKU-002",
									zone: "Zona A",
								},
								{
									time: "16:18",
									task: "Recepción muelle B completada",
									zone: "Muelle B",
								},
								{
									time: "16:04",
									task: "Ubicado palet SKU-006 en estante C-01",
									zone: "Zona C",
								},
								{
									time: "15:52",
									task: "Ajuste manual stock SKU-005 - rotura",
									zone: "Zona A",
								},
							].map((log, idx) => (
								<div
									key={idx}
									className="flex items-start justify-between text-xs border-b border-slate-900 pb-2"
								>
									<div>
										<p className="font-semibold text-slate-200">{log.task}</p>
										<p className="text-[10px] text-indigo-400 font-medium">{log.zone}</p>
									</div>
									<span className="text-[10px] text-slate-500 font-bold tabular-nums">{log.time}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
