import type React from "react";

// ==================== AuthModal ====================
export interface AuthModalProps {
	isOpen: boolean;
	onClose: () => void;
}

// ==================== CrudView ====================
export interface Field {
	key: string;
	label: string;
	type: "text" | "number" | "select";
	options?: string[];
}

export interface CrudViewProps {
	entityKey: string;
	title: string;
	data: any[];
	fields: Field[];
	onSave: (data: any, id: number | null) => void;
	onDelete: (id: number) => void;
	onBatchDelete?: (ids: number[]) => void;
	onInject: (quantity: number) => void;
	t: any;
}

// ==================== DesktopDashboardView ====================
export interface DesktopDashboardViewProps {
	dbState: any;
	filteredIn: any[];
	filteredOut: any[];
	t: any;
}

// ==================== FileUpload ====================
export interface FileUploadProps {
	onUpload?: (url: string, key: string) => void;
	className?: string;
}

export interface UploadedFile {
	name: string;
	url: string;
	key: string;
	size: number;
}

// ==================== KpiCard ====================
export interface KpiCardProps {
	title: string;
	value: string | number;
	subtitle: string;
	icon: React.ComponentType<any>;
	trend?: string;
	trendUp?: boolean;
	bgColor?: string;
	textColor?: string;
	iconColor?: string;
}

// ==================== MobileAppSimulator ====================
export interface MobileAppSimulatorProps {
	dbState: any;
	setDbState: React.Dispatch<React.SetStateAction<any>>;
	handleSave: (entity: string, data: any, id: number | null) => void;
	handleDelete: (entity: string, id: number) => void;
}

// ==================== SapIntegrationView ====================
export interface SapIntegrationViewProps {
	logs: any[];
	setDbState: React.Dispatch<React.SetStateAction<any>>;
}

// ==================== SidebarItem ====================
export interface SidebarItemProps {
	icon: React.ComponentType<any>;
	label: string;
	active: boolean;
	onClick: () => void;
	badge?: number;
}

// ==================== VoicePickingView ====================
export interface VoicePickingViewProps {
	pickingTasks: any[];
	products: any[];
}

// ==================== WhatsAppAgentView ====================
export interface WhatsAppAgentViewProps {
	chats: any[];
	setDbState: React.Dispatch<React.SetStateAction<any>>;
}
