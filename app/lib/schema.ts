import { relations } from "drizzle-orm";
import {
	bigint,
	bigserial,
	boolean,
	customType,
	index,
	integer,
	numeric,
	pgTable,
	pgView,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";

/** Postgres `bytea` exposed as a Node Buffer. */
const bytea = customType<{ data: Buffer; driverData: Buffer }>({
	dataType: () => "bytea",
});

// =====================================================================
// WMS domain tables (owned by db/migrations/0001_warehouse_schema.sql)
// =====================================================================

export const products = pgTable(
	"products",
	{
		id: bigserial("id", { mode: "number" }).primaryKey(),
		slug: text("slug").notNull().default(""),
		sku: text("sku").notNull().unique(),
		name: text("name").notNull(),
		category: text("category").notNull().default("General"),
		stock: integer("stock").notNull().default(0),
		min_stock: integer("min_stock").notNull().default(0),
		location: text("location").notNull().default(""),
		price: numeric("price", { precision: 10, scale: 2 }).notNull().default("0"),
		created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		index("idx_products_category").on(table.category),
		index("idx_products_stock").on(table.stock, table.min_stock),
		uniqueIndex("idx_products_slug").on(table.slug),
	],
);

export const customers = pgTable(
	"customers",
	{
		id: bigserial("id", { mode: "number" }).primaryKey(),
		slug: text("slug").notNull().default(""),
		code: text("code").notNull().unique(),
		name: text("name").notNull(),
		type: text("type").notNull().default("Cliente"),
		email: text("email").notNull().default(""),
		phone: text("phone").notNull().default(""),
		status: text("status").notNull().default("Activo"),
		created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		index("idx_customers_type_status").on(table.type, table.status),
		uniqueIndex("idx_customers_slug").on(table.slug),
	],
);

export const orders = pgTable(
	"orders",
	{
		id: bigserial("id", { mode: "number" }).primaryKey(),
		slug: text("slug").notNull().default(""),
		order_number: text("order_number").notNull().unique(),
		customer_name: text("customer_name").notNull().default(""),
		customer_id: bigint("customer_id", { mode: "number" }),
		status: text("status").notNull().default("Pendiente"),
		priority: text("priority").notNull().default("normal"),
		total_items: integer("total_items").notNull().default(0),
		total_value: numeric("total_value", { precision: 12, scale: 2 }).notNull().default("0"),
		created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		index("idx_orders_status").on(table.status),
		index("idx_orders_customer").on(table.customer_name),
		uniqueIndex("idx_orders_slug").on(table.slug),
	],
);

export const picking = pgTable(
	"picking",
	{
		id: bigserial("id", { mode: "number" }).primaryKey(),
		slug: text("slug").notNull().default(""),
		task_number: text("task_number").notNull().unique(),
		order_number: text("order_number").notNull().default(""),
		order_id: bigint("order_id", { mode: "number" }),
		assigned_to: text("assigned_to").notNull().default(""),
		staff_id: bigint("staff_id", { mode: "number" }),
		zone: text("zone").notNull().default(""),
		status: text("status").notNull().default("Pendiente"),
		total_items: integer("total_items").notNull().default(0),
		picked_items: integer("picked_items").notNull().default(0),
		created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		index("idx_picking_status").on(table.status),
		uniqueIndex("idx_picking_slug").on(table.slug),
	],
);

export const staff = pgTable(
	"staff",
	{
		id: bigserial("id", { mode: "number" }).primaryKey(),
		slug: text("slug").notNull().default(""),
		name: text("name").notNull(),
		role: text("role").notNull().default("Operario"),
		zone: text("zone").notNull().default(""),
		status: text("status").notNull().default("Activo"),
		created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		index("idx_staff_role_status").on(table.role, table.status),
		uniqueIndex("idx_staff_slug").on(table.slug),
	],
);

export const files = pgTable("files", {
	key: text("key").primaryKey(),
	content_type: text("content_type").notNull().default("application/octet-stream"),
	size: integer("size").notNull(),
	data: bytea("data").notNull(),
	uploaded_by: text("uploaded_by"),
	created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// =====================================================================
// Better Auth tables (created by `nub run db:auth:migrate`)
// Column names stay camelCase to match Better Auth's adapter.
// =====================================================================

export const user = pgTable(
	"user",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		email: text("email").notNull().unique(),
		emailVerified: boolean("emailVerified").notNull().default(false),
		image: text("image"),
		createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
		updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
		role: text("role"),
		zone: text("zone").notNull().default(""),
		phone: text("phone").notNull().default(""),
		isActive: boolean("isActive").notNull().default(true),
	},
	(table) => [index("idx_user_role").on(table.role)],
);

export const session = pgTable(
	"session",
	{
		id: text("id").primaryKey(),
		expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
		token: text("token").notNull().unique(),
		createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
		updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
		ipAddress: text("ipAddress"),
		userAgent: text("userAgent"),
		userId: text("userId")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [index("idx_session_user").on(table.userId)],
);

export const account = pgTable(
	"account",
	{
		id: text("id").primaryKey(),
		accountId: text("accountId").notNull(),
		providerId: text("providerId").notNull(),
		userId: text("userId")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("accessToken"),
		refreshToken: text("refreshToken"),
		idToken: text("idToken"),
		accessTokenExpiresAt: timestamp("accessTokenExpiresAt", { withTimezone: true }),
		refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", { withTimezone: true }),
		scope: text("scope"),
		password: text("password"),
		createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
		updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
	},
	(table) => [index("idx_account_user").on(table.userId)],
);

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
	createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
	updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
});

/** Read-only view created by db/migrations/0002_user_profiles_view.sql. */
export const userProfiles = pgView("user_profiles", {
	id: text("id").notNull(),
	email: text("email").notNull(),
	name: text("name").notNull(),
	role: text("role"),
	zone: text("zone").notNull(),
	phone: text("phone").notNull(),
	is_active: boolean("is_active").notNull(),
	last_login: timestamp("last_login", { withTimezone: true }),
	created_at: timestamp("created_at", { withTimezone: true }).notNull(),
	updated_at: timestamp("updated_at", { withTimezone: true }).notNull(),
}).existing();

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, { fields: [account.userId], references: [user.id] }),
}));
