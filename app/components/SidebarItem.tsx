import type { SidebarItemProps } from "../interfaces";

export default function SidebarItem({
	icon: Icon,
	label,
	active,
	onClick,
	badge,
}: SidebarItemProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-current={active ? "page" : undefined}
			className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl mb-1 border-l-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 ${
				active
					? "bg-indigo-600/10 text-indigo-300 border-indigo-500 font-semibold"
					: "border-transparent text-slate-400 hover:bg-slate-800/60 hover:text-white"
			}`}
		>
			<span className="flex items-center space-x-3 text-sm min-w-0">
				<Icon
					size={18}
					className={active ? "text-indigo-300 shrink-0" : "text-slate-400 shrink-0"}
					aria-hidden="true"
				/>
				<span className="truncate">{label}</span>
			</span>
			{badge !== undefined && (
				<span
					className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 tabular-nums ${
						active
							? "bg-indigo-500/80 text-white"
							: "bg-slate-800 text-slate-400 border border-slate-700/50"
					}`}
				>
					{badge}
				</span>
			)}
		</button>
	);
}
