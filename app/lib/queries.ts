import { gql } from "@apollo/client/core";

// ==================== PRODUCTS ====================

export const GET_PRODUCTS = gql`
	query GetProducts($limit: Int, $offset: Int, $category: String) {
		products(limit: $limit, offset: $offset, category: $category) {
			id
			slug
			sku
			name
			category
			stock
			min_stock
			location
			price
		}
	}
`;

export const GET_PRODUCT = gql`
	query GetProduct($slug: String!) {
		product(slug: $slug) {
			id
			slug
			sku
			name
			category
			stock
			min_stock
			location
			price
		}
	}
`;

export const CREATE_PRODUCT = gql`
	mutation CreateProduct($input: ProductInput!) {
		createProduct(input: $input) {
			id
			slug
			sku
			name
		}
	}
`;

export const UPDATE_PRODUCT = gql`
	mutation UpdateProduct($slug: String!, $input: ProductInput!) {
		updateProduct(slug: $slug, input: $input) {
			id
			slug
			sku
			name
			stock
		}
	}
`;

export const DELETE_PRODUCT = gql`
	mutation DeleteProduct($slug: String!) {
		deleteProduct(slug: $slug)
	}
`;

export const DELETE_PRODUCTS = gql`
	mutation DeleteProducts($slugs: [String!]!) {
		deleteProducts(slugs: $slugs)
	}
`;

// ==================== CUSTOMERS ====================

export const GET_CUSTOMERS = gql`
	query GetCustomers($limit: Int, $offset: Int, $type: String) {
		customers(limit: $limit, offset: $offset, type: $type) {
			id
			slug
			code
			name
			type
			email
			phone
			status
		}
	}
`;

export const GET_CUSTOMER = gql`
	query GetCustomer($slug: String!) {
		customer(slug: $slug) {
			id
			slug
			code
			name
			type
			email
			phone
			status
		}
	}
`;

export const CREATE_CUSTOMER = gql`
	mutation CreateCustomer($input: CustomerInput!) {
		createCustomer(input: $input) {
			id
			slug
			code
			name
		}
	}
`;

export const UPDATE_CUSTOMER = gql`
	mutation UpdateCustomer($slug: String!, $input: CustomerInput!) {
		updateCustomer(slug: $slug, input: $input) {
			id
			slug
			name
			status
		}
	}
`;

export const DELETE_CUSTOMER = gql`
	mutation DeleteCustomer($slug: String!) {
		deleteCustomer(slug: $slug)
	}
`;

// ==================== ORDERS ====================

export const GET_ORDERS = gql`
	query GetOrders($limit: Int, $offset: Int, $status: String, $priority: String) {
		orders(limit: $limit, offset: $offset, status: $status, priority: $priority) {
			id
			slug
			order_number
			customer_name
			status
			priority
			total_items
			total_value
		}
	}
`;

export const GET_ORDER = gql`
	query GetOrder($slug: String!) {
		order(slug: $slug) {
			id
			slug
			order_number
			customer_name
			status
			priority
			total_items
			total_value
		}
	}
`;

export const GET_INBOUND_ORDERS = gql`
	query GetInboundOrders($limit: Int) {
		inboundOrders(limit: $limit) {
			id
			slug
			order_number
			customer_name
			status
			total_items
			total_value
		}
	}
`;

export const GET_OUTBOUND_ORDERS = gql`
	query GetOutboundOrders($limit: Int) {
		outboundOrders(limit: $limit) {
			id
			slug
			order_number
			customer_name
			status
			total_items
			total_value
		}
	}
`;

export const CREATE_ORDER = gql`
	mutation CreateOrder($input: OrderInput!) {
		createOrder(input: $input) {
			id
			slug
			order_number
		}
	}
`;

export const UPDATE_ORDER = gql`
	mutation UpdateOrder($slug: String!, $input: OrderInput!) {
		updateOrder(slug: $slug, input: $input) {
			id
			slug
			status
		}
	}
`;

export const DELETE_ORDER = gql`
	mutation DeleteOrder($slug: String!) {
		deleteOrder(slug: $slug)
	}
`;

export const DELETE_ORDERS = gql`
	mutation DeleteOrders($slugs: [String!]!) {
		deleteOrders(slugs: $slugs)
	}
`;

// ==================== PICKING ====================

export const GET_PICKING_TASKS = gql`
	query GetPickingTasks($limit: Int, $status: String) {
		pickingTasks(limit: $limit, status: $status) {
			id
			slug
			task_number
			order_number
			assigned_to
			zone
			status
			total_items
			picked_items
		}
	}
`;

export const GET_PICKING_TASK = gql`
	query GetPickingTask($slug: String!) {
		pickingTask(slug: $slug) {
			id
			slug
			task_number
			order_number
			assigned_to
			zone
			status
			total_items
			picked_items
		}
	}
`;

export const CREATE_PICKING_TASK = gql`
	mutation CreatePickingTask($input: PickingTaskInput!) {
		createPickingTask(input: $input) {
			id
			slug
			task_number
		}
	}
`;

export const UPDATE_PICKING_TASK = gql`
	mutation UpdatePickingTask($slug: String!, $input: PickingTaskInput!) {
		updatePickingTask(slug: $slug, input: $input) {
			id
			slug
			status
			picked_items
		}
	}
`;

// ==================== STAFF ====================

export const GET_STAFF = gql`
	query GetStaff($limit: Int, $role: String, $status: String) {
		staff(limit: $limit, role: $role, status: $status) {
			id
			slug
			name
			role
			zone
			status
		}
	}
`;

export const GET_STAFF_MEMBER = gql`
	query GetStaffMember($slug: String!) {
		staffMember(slug: $slug) {
			id
			slug
			name
			role
			zone
			status
		}
	}
`;

export const CREATE_STAFF = gql`
	mutation CreateStaff($input: StaffInput!) {
		createStaff(input: $input) {
			id
			slug
			name
		}
	}
`;

export const UPDATE_STAFF = gql`
	mutation UpdateStaff($slug: String!, $input: StaffInput!) {
		updateStaff(slug: $slug, input: $input) {
			id
			slug
			name
			status
		}
	}
`;

export const DELETE_STAFF = gql`
	mutation DeleteStaff($slug: String!) {
		deleteStaff(slug: $slug)
	}
`;

export const DELETE_STAFF_MEMBERS = gql`
	mutation DeleteStaffMembers($slugs: [String!]!) {
		deleteStaffMembers(slugs: $slugs)
	}
`;

// ==================== DASHBOARD ====================

export const GET_DASHBOARD_STATS = gql`
	query GetDashboardStats {
		dashboardStats {
			totalProducts
			totalOrders
			totalCustomers
			totalStaff
			criticalStock
			pendingOrders
			activePicking
		}
	}
`;
