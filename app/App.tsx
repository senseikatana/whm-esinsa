"use client";

import {
	ArrowDownToLine,
	Bot,
	Cpu,
	Database,
	Globe,
	LayoutDashboard,
	Loader2,
	LogOut,
	MessageCircle,
	Mic,
	Package,
	Route,
	Search,
	Send,
	Users,
	X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import CrudView from "./components/CrudView";
import DesktopDashboardView from "./components/DesktopDashboardView";
import LoginPage from "./components/LoginPage";
import RoutesView from "./components/RoutesView";
import SapIntegrationView from "./components/SapIntegrationView";
// Import modular components
import SidebarItem from "./components/SidebarItem";
import VoicePickingView from "./components/VoicePickingView";
import WhatsAppAgentView from "./components/WhatsAppAgentView";
import { useAuth } from "./lib/auth-context";
import { withBasePath } from "./lib/base-path";
import {
	normalizeCustomer,
	normalizeOrder,
	normalizePicking,
	normalizeProduct,
	normalizeStaff,
} from "./lib/normalize";
import { SEED_CUSTOMERS, SEED_ORDERS, SEED_PICKING, SEED_PRODUCTS, SEED_STAFF } from "./lib/seeds";

// initial mock/fallback data derived from the canonical seed datasets in
// app/lib/seeds/* (kept in sync with the InsForge tables through migrations)
const PRODUCT_CATEGORIES: string[] = [
	"Espirometálicas",
	"Grafito Puro",
	"PTFE Fluoropolímero",
	"Kammprofile",
	"RTJ Metálica",
	"Tornillería B7/2H",
	"Tornillería Inox",
	"Tuercas 2H/8M",
	"Cobre Industrial",
	"Materia Prima Corte",
	"Seguridad Industrial",
	"EPI",
	"Palets",
	"Embalaje",
	"Etiquetado",
	"Equipamiento",
	"Almacenaje",
	"Tecnología",
];

const INITIAL_PRODUCTS = SEED_PRODUCTS.map((product, index) =>
	normalizeProduct({ id: index + 1, ...product }),
);
const INITIAL_CUSTOMERS = SEED_CUSTOMERS.map((customer, index) =>
	normalizeCustomer({ id: index + 1, ...customer }),
);
const INITIAL_ORDERS = SEED_ORDERS.map((order, index) =>
	normalizeOrder({ id: index + 1, ...order }),
);
const INITIAL_PICKING = SEED_PICKING.map((task, index) =>
	normalizePicking({ id: index + 1, ...task }),
);
const INITIAL_STAFF = SEED_STAFF.map((member, index) =>
	normalizeStaff({ id: index + 1, ...member }),
);

const INITIAL_WHATSAPP = [
	{
		id: 1,
		sender: "Chofer - Luis (Transportista)",
		message: "Hola, estoy llegando con el camión al muelle B. ¿Está libre?",
		time: "16:02",
		responseByAI:
			"Hola Luis, sí, el muelle B está libre para descarga. Te espera el operario Carlos.",
	},
	{
		id: 2,
		sender: "Supervisor - Ramón",
		message: "Necesitamos reubicar los palets de la zona C a la A urgente.",
		time: "15:45",
		responseByAI: "Mensaje recibido Ramón. Se han generado tareas prioritarias para el equipo.",
	},
];

const INITIAL_SAP_LOGS = [
	{
		id: 1,
		timestamp: "16:20:11",
		event: "Sincronización de Stock SKU-001 exitosa",
		type: "info",
	},
	{
		id: 2,
		timestamp: "16:15:34",
		event: "SAP ERP importó orden de venta PED-2026-006",
		type: "info",
	},
	{
		id: 3,
		timestamp: "16:00:22",
		event: "Error temporal en conexión SAP RFC. Reintentando…",
		type: "warning",
	},
];

// Helper to get AI API key (SSR-safe)
const getAIApiKey = () =>
	typeof window !== "undefined" ? localStorage.getItem("ai_api_key") || "" : "";

// callAI helper (DeepSeek)
const callGeminiAPI = async (
	prompt: string,
	systemInstruction = "Eres el consultor logístico y asistente experto AI de WarehouseFlow. Tus respuestas deben ser sumamente profesionales, concisas y directas.",
) => {
	const apiKey = getAIApiKey();
	if (!apiKey) {
		await new Promise((res) => setTimeout(res, 800));
		if (prompt.toLowerCase().includes("json")) {
			if (prompt.includes("inventory")) {
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
			if (prompt.includes("crm") || prompt.includes("cliente")) {
				return JSON.stringify({
					code: `CUST0${Math.floor(10 + Math.random() * 90)}`,
					name: "Empresa Logística IA",
					type: "Cliente",
					email: "ia@empresalogistica.com",
					phone: "+34 600 000 000",
					status: "Activo",
				});
			}
			if (prompt.includes("order") || prompt.includes("orden")) {
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
		if (prompt.toLowerCase().includes("ruta")) {
			return "Optimización IA sugerida: La ruta más corta para picking es de Dock A -> Pasillo A-02 -> Rack Level 3 -> Consolidador A. Esto ahorra un 22% de tiempo de recorrido.";
		}
		if (prompt.toLowerCase().includes("whatsapp")) {
			return "Hola, sí. Su pedido ya está listo para despacho en el Muelle de Carga C. Puede ingresar con el camión ahora.";
		}
		return "Simulación de Asistente IA de WarehouseFlow: Se sugiere optimizar la ubicación de la categoría Palets debido a una alta tasa de rotación (Clase A).";
	}

	const url = "https://api.deepseek.com/v1/chat/completions";
	const payload = {
		model: "deepseek-chat",
		messages: [
			{ role: "system", content: systemInstruction },
			{ role: "user", content: prompt },
		],
		temperature: 0.7,
		max_tokens: 2048,
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
		if (!response.ok) throw new Error("API Error");
		const data = await response.json();
		return data.choices?.[0]?.message?.content || "Sin respuesta del modelo.";
	} catch (err) {
		console.error("DeepSeek API Error:", err);
		return "Error al comunicar con DeepSeek API.";
	}
};

const translations = {
	es: {
		dashboard: "Panel General",
		inventory: "Inventario & Stock",
		crm: "Clientes & CRM",
		inOrders: "Entradas (Inbounds)",
		outOrders: "Salidas (Outbounds)",
		picking: "Picking por Voz (IA)",
		routes: "Rutas Internas",
		whatsapp: "Agente WhatsApp AI",
		sap: "SAP ERP Integration",
		users: "Equipo y Operarios",
		search: "Buscar en base de datos…",
		welcome: "WarehouseFlow SGA",
		currentShift: "Turno Activo · Muelles A, B y C Operativos",
		compRate: "Tasa de Servicio",
		inToday: "Recepciones Hoy",
		pendingDisp: "Despachos Pdtes.",
		lowStock: "Artículos Críticos",
		accuracy: "Precisión Stock",
		activeOrders: "Órdenes Activas",
		objective: "Objetivo",
		add: "Añadir",
		save: "Guardar",
		cancel: "Cancelar",
		edit: "Editar",
		delete: "Eliminar",
		actions: "Acciones",
		welcomeAuth: "Acceso WarehouseFlow",
		copyright: "© 2026 WarehouseFlow · WMS Enterprise Solution",
		viewMode: "Modo de Vista",
		adminView: "Administrador (Escritorio)",
		operatorView: "Operario (Handheld PDA)",
	},
	en: {
		dashboard: "Dashboard",
		inventory: "Inventory & Stock",
		crm: "CRM & Clients",
		inOrders: "Inbound Orders",
		outOrders: "Outbound Orders",
		picking: "AI Voice Picking",
		routes: "Internal Routes",
		whatsapp: "WhatsApp AI Agent",
		sap: "SAP ERP Integration",
		users: "Team & Operators",
		search: "Search database records…",
		welcome: "WarehouseFlow WMS",
		currentShift: "Active Shift · Docks A, B, and C Operational",
		compRate: "Service Level",
		inToday: "Inbounds Today",
		pendingDisp: "Pending Shippings",
		lowStock: "Critical Stock",
		accuracy: "Stock Accuracy",
		activeOrders: "Active Orders",
		objective: "Target",
		add: "Add New",
		save: "Save",
		cancel: "Cancel",
		edit: "Edit",
		delete: "Delete",
		actions: "Actions",
		welcomeAuth: "WarehouseFlow Login",
		copyright: "© 2026 WarehouseFlow · WMS Enterprise Solution",
		viewMode: "View Mode",
		adminView: "Manager (Desktop)",
		operatorView: "Operator (Handheld PDA)",
	},
};

export default function App() {
	const { user, loading: authLoading, logout } = useAuth();
	const [lang, setLang] = useState<"es" | "en">("es");
	const [activeTab, setActiveTab] = useState<string>("dashboard");
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
	const [dbState, setDbState] = useState({
		products: INITIAL_PRODUCTS,
		customers: INITIAL_CUSTOMERS,
		orders: INITIAL_ORDERS,
		picking: INITIAL_PICKING,
		staff: INITIAL_STAFF,
		whatsapp: INITIAL_WHATSAPP,
		sapLogs: INITIAL_SAP_LOGS,
	});

	const [loading, setLoading] = useState<boolean>(false);

	// AI Modal Configuration — SSR-safe: init with stable defaults,
	// read localStorage only in useEffect after hydration.
	const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
	const [tempApiKey, setTempApiKey] = useState("");
	const [hasApiKey, setHasApiKey] = useState(false);

	const t = translations[lang];

	// Hydrate AI API key from localStorage after mount
	useEffect(() => {
		const key = getAIApiKey();
		setTempApiKey(key);
		setHasApiKey(!!key);
	}, []);

	// API fetches with fallback logic
	const loadData = useCallback(async () => {
		setLoading(true);
		try {
			const endpoints = [
				{ key: "products", url: withBasePath("/api/products"), normalize: normalizeProduct },
				{ key: "customers", url: withBasePath("/api/customers"), normalize: normalizeCustomer },
				{ key: "orders", url: withBasePath("/api/orders"), normalize: normalizeOrder },
				{ key: "picking", url: withBasePath("/api/picking-tasks"), normalize: normalizePicking },
			];

			const results = await Promise.allSettled(
				endpoints.map(async ({ url }) => {
					const res = await fetch(url);
					if (!res.ok) throw new Error(`${res.status}`);
					return res.json();
				}),
			);

			let connected = false;
			setDbState((prev) => {
				const next = { ...prev };
				for (let i = 0; i < endpoints.length; i++) {
					const result = results[i];
					if (result.status === "fulfilled" && result.value?.success) {
						const items = result.value.data.items ?? [];
						(next as any)[endpoints[i].key] = items.map(endpoints[i].normalize);
						connected = true;
					}
				}
				return next;
			});
			setIsBackendConnected(connected);
		} catch {
			setIsBackendConnected(false);
		} finally {
			setLoading(false);
		}
	}, []);

	// Load data once on mount
	useEffect(() => {
		loadData();
	}, [loadData]);

	// Inbound = recepciones (REC-*); everything else is an outbound pedido.
	const filteredInOrders = useMemo(() => {
		return dbState.orders.filter((o: any) => o.orderNumber?.startsWith("REC"));
	}, [dbState.orders]);

	const filteredOutOrders = useMemo(() => {
		return dbState.orders.filter((o: any) => !filteredInOrders.includes(o));
	}, [dbState.orders, filteredInOrders]);

	// Handle Saves / Creates
	const handleSave = async (entity: string, data: any, id: number | null) => {
		setLoading(true);
		try {
			let endpoint = "";
			if (entity === "products") endpoint = "/products";
			else if (entity === "customers") endpoint = "/customers";
			else if (entity === "orders") endpoint = "/orders";
			else if (entity === "picking") endpoint = "/picking-tasks";

			if (isBackendConnected && endpoint) {
				const method = id ? "PUT" : "POST";
				const url = withBasePath(id ? `/api${endpoint}/${id}` : `/api${endpoint}`);

				// adapt data for backend schema if needed
				const payload = { ...data };
				if (entity === "products") {
					payload.stock = Number(payload.stock || 0);
					payload.minStock = Number(payload.minStock || 10);
					payload.price = Number(payload.price || 0);
				} else if (entity === "orders") {
					payload.totalItems = Number(payload.totalItems || 0);
					payload.totalValue = Number(payload.totalValue || 0);
				}

				const res = await fetch(url, {
					method,
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				});
				const json = await res.json();
				if (json.success) {
					loadData();
					setLoading(false);
					return;
				}
			}
		} catch (e) {
			console.error("API error while saving, updating locally", e);
		}

		// Local Fallback State Update
		if (id) {
			setDbState((prev) => {
				const targetList = (prev as any)[entity];
				const updatedList = targetList.map((item: any) =>
					item.id === id ? { ...item, ...data } : item,
				);
				return { ...prev, [entity]: updatedList };
			});
		} else {
			const newId = Math.floor(1000 + Math.random() * 9000);
			setDbState((prev) => {
				const targetList = (prev as any)[entity];
				return { ...prev, [entity]: [...targetList, { id: newId, ...data }] };
			});
		}
		setLoading(false);
	};

	// Handle Deletes
	const handleDelete = async (entity: string, id: number) => {
		setLoading(true);
		try {
			let endpoint = "";
			if (entity === "products") endpoint = "/products";
			else if (entity === "customers") endpoint = "/customers";
			else if (entity === "orders") endpoint = "/orders";
			else if (entity === "picking") endpoint = "/picking-tasks";

			if (isBackendConnected && endpoint) {
				const res = await fetch(withBasePath(`/api${endpoint}/${id}`), { method: "DELETE" });
				const json = await res.json();
				if (json.success) {
					loadData();
					setLoading(false);
					return;
				}
			}
		} catch (e) {
			console.error("API error while deleting, removing locally", e);
		}

		setDbState((prev) => {
			const targetList = (prev as any)[entity];
			return {
				...prev,
				[entity]: targetList.filter((item: any) => item.id !== id),
			};
		});
		setLoading(false);
	};

	// Handle Batch Deletes
	const handleBatchDelete = async (entity: string, ids: number[]) => {
		setLoading(true);
		setDbState((prev) => {
			const targetList = (prev as any)[entity];
			return {
				...prev,
				[entity]: targetList.filter((item: any) => !ids.includes(item.id)),
			};
		});
		setLoading(false);
	};

	// AI Lote mock generator
	const handleInjectMock = async (entity: string, quantity = 1) => {
		setLoading(true);
		try {
			const prompt = `Genera un array JSON de ${quantity} objetos para la tabla "${entity}".
      Invéntate datos realistas de logística B2B. Claves obligatorias:
      ${entity === "products" ? "sku, name, category, stock, minStock, location, price" : ""}
      ${entity === "customers" ? "code, name, type (Cliente o Proveedor), email, phone, status (Activo)" : ""}
      ${entity === "orders" ? "orderNumber (ej. PED-2026-999), customerName, status (Pendiente), totalItems, totalValue" : ""}
      ${entity === "staff" ? "name, role (Operario/Supervisor/Administrador), zone, status (Activo)" : ""}
      Devuelve ÚNICAMENTE el array JSON sin formatear con markdown ni bloques de código.`;

			const res = await callGeminiAPI(prompt, "Eres un generador de datos JSON válidos de WMS.");
			const cleanedJson = res
				.replace(/```json/g, "")
				.replace(/```/g, "")
				.trim();
			const parsed = JSON.parse(cleanedJson);
			const items = Array.isArray(parsed) ? parsed : [parsed];

			for (const item of items.slice(0, quantity)) {
				await handleSave(entity, item, null);
			}
		} catch (_e) {
			// Manual mock data injection if no AI or parsing error
			for (let i = 0; i < quantity; i++) {
				if (entity === "products") {
					const randomNum = Math.floor(100 + Math.random() * 900);
					await handleSave(
						"products",
						{
							sku: `SKU-${randomNum}`,
							name: `Caja SKU-${randomNum} Premium`,
							category: PRODUCT_CATEGORIES[Math.floor(Math.random() * PRODUCT_CATEGORIES.length)],
							stock: Math.floor(Math.random() * 500),
							minStock: 20,
							location: `B-0${Math.floor(1 + Math.random() * 8)}-0${Math.floor(1 + Math.random() * 5)}`,
							price: parseFloat((Math.random() * 30).toFixed(2)),
						},
						null,
					);
				} else if (entity === "customers") {
					const randomNum = Math.floor(10 + Math.random() * 89);
					const names = ["Alcampo", "Dia", "Lidl", "Aldi", "Eroski", "Consum"];
					await handleSave(
						"customers",
						{
							code: `CUST0${randomNum}`,
							name: `${names[Math.floor(Math.random() * names.length)]} S.A. ${randomNum}`,
							type: Math.random() > 0.3 ? "Cliente" : "Proveedor",
							email: `logistica@empresa${randomNum}.es`,
							phone: `+34 900 ${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}`,
							status: "Activo",
						},
						null,
					);
				} else if (entity === "orders") {
					const randomNum = Math.floor(100 + Math.random() * 899);
					const customers = [
						"Mercadona S.A.",
						"Carrefour España",
						"El Corte Inglés",
						"Distribuciones García SL",
					];
					const statuses = ["Pendiente", "Picking", "Packing", "Despachado"];
					await handleSave(
						"orders",
						{
							orderNumber: `PED-2026-${randomNum}`,
							customerName: customers[Math.floor(Math.random() * customers.length)],
							status: statuses[Math.floor(Math.random() * statuses.length)],
							priority: Math.random() > 0.5 ? "high" : "normal",
							totalItems: Math.floor(1 + Math.random() * 15),
							totalValue: parseFloat((Math.random() * 5000).toFixed(2)),
						},
						null,
					);
				} else if (entity === "staff") {
					const names = ["Pedro García", "Ana López", "Luis Martínez", "Carmen Ruiz", "José Fernández"];
					const roles = ["Operario", "Supervisor", "Operario", "Operario"];
					const zones = ["Zona A", "Zona B", "Zona C", "Oficina"];
					await handleSave(
						"staff",
						{
							name: names[Math.floor(Math.random() * names.length)],
							role: roles[Math.floor(Math.random() * roles.length)],
							zone: zones[Math.floor(Math.random() * zones.length)],
							status: "Activo",
						},
						null,
					);
				}
			}
		} finally {
			setLoading(false);
		}
	};

	// Save AI API Key
	const handleSaveApiKey = () => {
		localStorage.setItem("ai_api_key", tempApiKey);
		setHasApiKey(!!tempApiKey);
		setIsApiKeyModalOpen(false);
	};

	// Global search filtering
	const searchFilteredProducts = useMemo(() => {
		return dbState.products.filter(
			(p) =>
				p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.location.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	}, [dbState.products, searchQuery]);

	// Auth check — after all hooks
	if (!authLoading && !user) {
		return <LoginPage />;
	}

	if (authLoading) {
		return (
			<div
				className="min-h-screen bg-[#050811] flex items-center justify-center"
				role="status"
				aria-label="Cargando sesión"
			>
				<div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
				<span className="sr-only">Cargando…</span>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans select-none antialiased">
			{/* Top Banner / Navigation */}
			<header className="bg-[#050811] border-b border-slate-800/80 shrink-0 sticky top-0 z-40 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
				<div className="flex items-center space-x-3.5">
					<div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/30">
						<Package size={24} className="text-white" />
					</div>
					<div>
						<h1 className="text-lg font-black tracking-tight flex items-center gap-2">
							WarehouseFlow{" "}
							<span className="bg-indigo-900/60 text-indigo-300 text-[10px] uppercase font-bold py-0.5 px-2 rounded-full border border-indigo-700/50">
								SGA
							</span>
						</h1>
						<p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
							{t.currentShift}
						</p>
					</div>
				</div>

				{/* Search Bar */}
				<div className="relative w-full max-w-xs md:max-w-md hidden sm:block">
					<Search
						size={18}
						className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
						aria-hidden="true"
					/>
					<input
						type="text"
						aria-label={t.search}
						placeholder={t.search}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full bg-[#050811] border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-600 focus-visible:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/30 transition-colors duration-200"
					/>
				</div>

				<div className="flex items-center space-x-4">
					{/* SQLite DB Status Indicator */}
					<div className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#0b0f19] border border-slate-800 rounded-xl text-xs font-semibold">
						<Database
							size={14}
							className={isBackendConnected ? "text-emerald-500" : "text-amber-500"}
							aria-hidden="true"
						/>
						<span className="hidden md:inline">
							{isBackendConnected ? "Servidor SQLite" : "Mock Offline"}
						</span>
					</div>

					{/* AI Key button */}
					<button
						type="button"
						onClick={() => setIsApiKeyModalOpen(true)}
						className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed ${
							hasApiKey
								? "bg-indigo-950/60 text-indigo-300 border-indigo-800/80 hover:bg-indigo-900/40"
								: "bg-amber-950/60 text-amber-300 border-amber-800/80 hover:bg-amber-900/40"
						}`}
					>
						<Bot
							size={14}
							className={hasApiKey ? "text-indigo-400" : "text-amber-400"}
							aria-hidden="true"
						/>
						<span>{hasApiKey ? "DeepSeek Activo" : "Conectar IA"}</span>
					</button>

					{/* Language selection */}
					<button
						type="button"
						onClick={() => setLang(lang === "es" ? "en" : "es")}
						className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
						title="Cambiar Idioma"
						aria-label="Cambiar idioma"
					>
						<Globe size={18} aria-hidden="true" />
					</button>

					{/* User info + Logout */}
					<div className="flex items-center gap-2">
						<span className="text-xs text-slate-400 hidden md:inline">{user?.email}</span>
						<button
							type="button"
							onClick={logout}
							className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
							title="Cerrar sesión"
							aria-label="Cerrar sesión"
						>
							<LogOut size={18} aria-hidden="true" />
						</button>
					</div>
				</div>
			</header>

			{/* Main Container */}
			<div className="flex-1 flex overflow-hidden">
				{/* Desktop Sidebar */}
				<aside className="w-64 bg-[#050811] border-r border-slate-800/80 p-4 shrink-0 hidden md:flex flex-col justify-between overflow-y-auto">
					<div className="space-y-1">
						<p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 mb-3">
							Módulos SGA
						</p>
						<SidebarItem
							icon={LayoutDashboard}
							label={t.dashboard}
							active={activeTab === "dashboard"}
							onClick={() => setActiveTab("dashboard")}
						/>
						<SidebarItem
							icon={Package}
							label={t.inventory}
							active={activeTab === "inventory"}
							onClick={() => setActiveTab("inventory")}
							badge={dbState.products.length}
						/>
						<SidebarItem
							icon={ArrowDownToLine}
							label={t.inOrders}
							active={activeTab === "inbound"}
							onClick={() => setActiveTab("inbound")}
							badge={filteredInOrders.length}
						/>
						<SidebarItem
							icon={Send}
							label={t.outOrders}
							active={activeTab === "outbound"}
							onClick={() => setActiveTab("outbound")}
							badge={filteredOutOrders.length}
						/>
						<SidebarItem
							icon={Mic}
							label={t.picking}
							active={activeTab === "picking"}
							onClick={() => setActiveTab("picking")}
						/>

						<p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 mt-6 mb-3">
							Inteligencia
						</p>
						<SidebarItem
							icon={Route}
							label={t.routes}
							active={activeTab === "routes"}
							onClick={() => setActiveTab("routes")}
						/>
						<SidebarItem
							icon={MessageCircle}
							label={t.whatsapp}
							active={activeTab === "whatsapp"}
							onClick={() => setActiveTab("whatsapp")}
						/>

						<p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 mt-6 mb-3">
							Configuración
						</p>
						<SidebarItem
							icon={Users}
							label={t.users}
							active={activeTab === "users"}
							onClick={() => setActiveTab("users")}
						/>
						<SidebarItem
							icon={Cpu}
							label={t.sap}
							active={activeTab === "sap"}
							onClick={() => setActiveTab("sap")}
						/>
					</div>

					<div className="p-4 bg-slate-900/20 rounded-2xl border border-slate-800 text-[10px] text-slate-500 font-semibold uppercase text-center tracking-wide">
						{t.copyright}
					</div>
				</aside>

				{/* Mobile Bottom Navigation */}
				<nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#050811] border-t border-slate-800 h-16 flex justify-around items-center px-2 z-30">
					<button
						type="button"
						onClick={() => setActiveTab("dashboard")}
						aria-current={activeTab === "dashboard" ? "page" : undefined}
						className={`flex flex-col items-center p-2 rounded-xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 ${
							activeTab === "dashboard" ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
						}`}
					>
						<LayoutDashboard size={20} aria-hidden="true" />
						<span className="text-[9px] mt-0.5">{t.dashboard}</span>
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("inventory")}
						aria-current={activeTab === "inventory" ? "page" : undefined}
						className={`flex flex-col items-center p-2 relative rounded-xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 ${
							activeTab === "inventory" ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
						}`}
					>
						<Package size={20} aria-hidden="true" />
						<span className="text-[9px] mt-0.5">{t.inventory}</span>
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("picking")}
						aria-current={activeTab === "picking" ? "page" : undefined}
						className={`flex flex-col items-center p-2 rounded-xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 ${
							activeTab === "picking" ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
						}`}
					>
						<Mic size={20} aria-hidden="true" />
						<span className="text-[9px] mt-0.5">{t.picking}</span>
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("whatsapp")}
						aria-current={activeTab === "whatsapp" ? "page" : undefined}
						className={`flex flex-col items-center p-2 rounded-xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 ${
							activeTab === "whatsapp" ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
						}`}
					>
						<MessageCircle size={20} aria-hidden="true" />
						<span className="text-[9px] mt-0.5">WhatsApp</span>
					</button>
				</nav>

				{/* Main Content Area */}
				<main className="flex-1 bg-[#050811] overflow-y-auto p-6 md:p-8 pb-24 md:pb-8">
					{loading && (
						<div
							className="fixed inset-0 bg-[#050811]/70 backdrop-blur-sm flex items-center justify-center z-50"
							role="status"
							aria-label="Cargando datos"
						>
							<Loader2 className="animate-spin text-indigo-500" size={40} aria-hidden="true" />
							<span className="sr-only">Cargando…</span>
						</div>
					)}

					{activeTab === "dashboard" && (
						<DesktopDashboardView
							dbState={dbState}
							filteredIn={filteredInOrders}
							filteredOut={filteredOutOrders}
							t={t}
						/>
					)}
					{activeTab === "inventory" && (
						<CrudView
							entityKey="products"
							title="Inventario de Productos"
							data={searchQuery ? searchFilteredProducts : dbState.products}
							fields={[
								{ key: "sku", label: "SKU", type: "text" },
								{ key: "name", label: "Nombre", type: "text" },
								{
									key: "category",
									label: "Categoría",
									type: "select",
									options: PRODUCT_CATEGORIES,
								},
								{ key: "stock", label: "Stock Actual", type: "number" },
								{ key: "minStock", label: "Stock Mínimo", type: "number" },
								{
									key: "location",
									label: "Ubicación (Pasillo-Rack-Nivel)",
									type: "text",
								},
								{ key: "price", label: "Precio (€)", type: "number" },
							]}
							onSave={(d: any, id: any) => handleSave("products", d, id)}
							onDelete={(id: any) => handleDelete("products", id)}
							onBatchDelete={(ids: number[]) => handleBatchDelete("products", ids)}
							onInject={(qty) => handleInjectMock("products", qty)}
							t={t}
						/>
					)}
					{activeTab === "inbound" && (
						<CrudView
							entityKey="orders"
							title="Recepciones - Entrada de Mercancía"
							data={filteredInOrders}
							fields={[
								{
									key: "orderNumber",
									label: "Nº Orden de Entrada",
									type: "text",
								},
								{ key: "customerName", label: "Proveedor", type: "text" },
								{
									key: "status",
									label: "Estado",
									type: "select",
									options: ["Pendiente", "Control de Calidad", "Recibido", "Completado", "Cancelado"],
								},
								{
									key: "totalItems",
									label: "Bultos Totales",
									type: "number",
								},
								{ key: "totalValue", label: "Valor (€)", type: "number" },
							]}
							onSave={(d: any, id: any) => handleSave("orders", d, id)}
							onDelete={(id: any) => handleDelete("orders", id)}
							onBatchDelete={(ids: number[]) => handleBatchDelete("orders", ids)}
							onInject={(qty) => handleInjectMock("orders", qty)}
							t={t}
						/>
					)}
					{activeTab === "outbound" && (
						<CrudView
							entityKey="orders"
							title="Expediciones - Envío de Pedidos"
							data={filteredOutOrders}
							fields={[
								{
									key: "orderNumber",
									label: "Nº Pedido Cliente",
									type: "text",
								},
								{ key: "customerName", label: "Cliente", type: "text" },
								{
									key: "status",
									label: "Estado",
									type: "select",
									options: ["Pendiente", "Picking", "Packing", "Despachado", "Completado", "Cancelado"],
								},
								{
									key: "totalItems",
									label: "Total Bultos",
									type: "number",
								},
								{ key: "totalValue", label: "Valor (€)", type: "number" },
							]}
							onSave={(d: any, id: any) => handleSave("orders", d, id)}
							onDelete={(id: any) => handleDelete("orders", id)}
							onBatchDelete={(ids: number[]) => handleBatchDelete("orders", ids)}
							onInject={(qty) => handleInjectMock("orders", qty)}
							t={t}
						/>
					)}
					{activeTab === "picking" && (
						<VoicePickingView pickingTasks={dbState.picking} products={dbState.products} />
					)}
					{activeTab === "routes" && <RoutesView />}
					{activeTab === "whatsapp" && (
						<WhatsAppAgentView chats={dbState.whatsapp} setDbState={setDbState} />
					)}
					{activeTab === "users" && (
						<CrudView
							entityKey="staff"
							title="Personal & Turnos de Almacén"
							data={dbState.staff}
							fields={[
								{ key: "name", label: "Nombre Operario", type: "text" },
								{
									key: "role",
									label: "Rol",
									type: "select",
									options: ["Administrador", "Supervisor", "Operario", "Picker", "Mantenimiento"],
								},
								{ key: "zone", label: "Zona Asignada", type: "text" },
								{
									key: "status",
									label: "Estado Operativo",
									type: "select",
									options: ["Activo", "Inactivo", "En Ruta"],
								},
							]}
							onSave={(d: any, id: any) => handleSave("staff", d, id)}
							onDelete={(id: any) => handleDelete("staff", id)}
							onBatchDelete={(ids: number[]) => handleBatchDelete("staff", ids)}
							onInject={(qty) => handleInjectMock("staff", qty)}
							t={t}
						/>
					)}
					{activeTab === "sap" && <SapIntegrationView logs={dbState.sapLogs} setDbState={setDbState} />}
				</main>
			</div>

			{/* AI API Key Modal */}
			{isApiKeyModalOpen && (
				<div className="fixed inset-0 bg-[#050811]/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
					<div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[85vh] overflow-y-auto overscroll-contain">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-bold flex items-center gap-2 text-indigo-400">
								<Bot size={20} aria-hidden="true" /> Conectar Inteligencia Artificial
							</h3>
							<button
								type="button"
								onClick={() => setIsApiKeyModalOpen(false)}
								className="p-1.5 -mr-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
								aria-label="Cerrar"
							>
								<X size={20} aria-hidden="true" />
							</button>
						</div>
						<p className="text-xs text-slate-400 mb-4">
							Introduce tu clave API de DeepSeek. Se guardará de forma local en tu navegador para habilitar
							la generación de respuestas reales y autocompletado en el SGA.
						</p>
						<input
							type="password"
							aria-label="DeepSeek API Key"
							placeholder="DeepSeek API Key (sk-…)"
							value={tempApiKey}
							onChange={(e) => setTempApiKey(e.target.value)}
							className="w-full bg-[#050811] border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus-visible:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/30 mb-4"
						/>
						<div className="flex justify-end space-x-3 text-sm">
							<button
								type="button"
								onClick={() => {
									setTempApiKey("");
									localStorage.removeItem("ai_api_key");
									setHasApiKey(false);
									setIsApiKeyModalOpen(false);
								}}
								className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Limpiar Clave
							</button>
							<button
								type="button"
								onClick={handleSaveApiKey}
								className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Guardar
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
