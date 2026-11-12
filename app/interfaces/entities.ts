// ==================== Product ====================
export interface Product {
	id: number;
	slug: string;
	sku: string;
	name: string;
	category: string;
	stock: number;
	min_stock: number;
	minStock?: number;
	location: string;
	price: number;
	created_at?: string;
	updated_at?: string;
}

// ==================== Customer ====================
export interface Customer {
	id: number;
	slug: string;
	code: string;
	name: string;
	type: string;
	email: string;
	phone: string;
	status: string;
	created_at?: string;
	updated_at?: string;
}

// ==================== Order ====================
export interface Order {
	id: number;
	slug: string;
	order_number: string;
	orderNumber?: string;
	customer_name: string;
	customerName?: string;
	status: string;
	priority: string;
	total_items: number;
	totalItems?: number;
	total_value: number;
	totalValue?: number;
	created_at?: string;
	updated_at?: string;
}

// ==================== PickingTask ====================
export interface PickingTask {
	id: number;
	slug: string;
	task_number: string;
	taskNumber?: string;
	order_number: string;
	orderNumber?: string;
	assigned_to: string;
	assignedTo?: string;
	zone: string;
	status: string;
	total_items: number;
	totalItems?: number;
	picked_items: number;
	pickedItems?: number;
	created_at?: string;
	updated_at?: string;
}

// ==================== Staff ====================
export interface Staff {
	id: number;
	slug: string;
	name: string;
	role: string;
	zone: string;
	status: string;
	created_at?: string;
	updated_at?: string;
}

// ==================== User Profile ====================
export type UserRole = "admin" | "manager" | "supervisor" | "operator" | "picker" | "viewer";

export interface UserProfile {
	id: string;
	email: string;
	name: string;
	role: UserRole;
	zone: string;
	phone: string;
	is_active: boolean;
	last_login?: string;
	created_at?: string;
	updated_at?: string;
}
