import { TrendingDown, TrendingUp } from "lucide-react";
import type { KpiCardProps } from "../interfaces";

export default function KpiCard({
	title,
	value,
	subtitle,
	icon: Icon,
	trend,
	trendUp,
}: KpiCardProps) {
	return (
		<div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between transition-colors duration-200 hover:border-slate-700">
			<div className="flex justify-between items-start">
				<div className="p-3 bg-[#050811] border border-slate-800 text-indigo-400 rounded-xl">
					<Icon size={20} aria-hidden="true" />
				</div>
				{trend && (
					<span
						className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 tabular-nums ${
							trendUp
								? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40"
								: "bg-rose-950/40 text-rose-400 border border-rose-800/40"
						}`}
					>
						{trendUp ? (
							<TrendingUp size={10} aria-hidden="true" />
						) : (
							<TrendingDown size={10} aria-hidden="true" />
						)}
						{trend}
					</span>
				)}
			</div>
			<div className="mt-4">
				<p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{title}</p>
				<h3 className="text-2xl font-black mt-1 tracking-tight text-white tabular-nums">{value}</h3>
				<p className="text-xs text-slate-400 mt-1">{subtitle}</p>
			</div>
		</div>
	);
}
