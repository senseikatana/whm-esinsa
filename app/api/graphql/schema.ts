export const typeDefs = `#graphql
  scalar DateTime

  type Product {
    id: Int!
    slug: String!
    sku: String!
    name: String!
    category: String!
    stock: Int!
    min_stock: Int!
    location: String!
    price: Float!
    created_at: DateTime
    updated_at: DateTime
  }

  type Customer {
    id: Int!
    slug: String!
    code: String!
    name: String!
    type: String!
    email: String!
    phone: String!
    status: String!
    created_at: DateTime
    updated_at: DateTime
  }

  type Order {
    id: Int!
    slug: String!
    order_number: String!
    customer_name: String!
    status: String!
    priority: String!
    total_items: Int!
    total_value: Float!
    created_at: DateTime
    updated_at: DateTime
  }

  type PickingTask {
    id: Int!
    slug: String!
    task_number: String!
    order_number: String!
    assigned_to: String!
    zone: String!
    status: String!
    total_items: Int!
    picked_items: Int!
    created_at: DateTime
    updated_at: DateTime
  }

  type Staff {
    id: Int!
    slug: String!
    name: String!
    role: String!
    zone: String!
    status: String!
    created_at: DateTime
    updated_at: DateTime
  }

  type UserProfile {
    id: ID!
    email: String!
    name: String!
    role: String!
    zone: String!
    phone: String!
    is_active: Boolean!
    last_login: DateTime
  }

  type DashboardStats {
    totalProducts: Int!
    totalOrders: Int!
    totalCustomers: Int!
    totalStaff: Int!
    criticalStock: Int!
    pendingOrders: Int!
    activePicking: Int!
  }

  type Query {
    # Products
    products(limit: Int, offset: Int, category: String, search: String): [Product!]!
    product(slug: String!): Product

    # Customers
    customers(limit: Int, offset: Int, type: String, search: String): [Customer!]!
    customer(slug: String!): Customer

    # Orders
    orders(limit: Int, offset: Int, status: String, priority: String, search: String): [Order!]!
    order(slug: String!): Order
    inboundOrders(limit: Int): [Order!]!
    outboundOrders(limit: Int): [Order!]!

    # Picking
    pickingTasks(limit: Int, offset: Int, status: String): [PickingTask!]!
    pickingTask(slug: String!): PickingTask

    # Staff
    staff(limit: Int, offset: Int, role: String, status: String): [Staff!]!
    staffMember(slug: String!): Staff

    # Dashboard
    dashboardStats: DashboardStats!

    # Users
    userProfiles(limit: Int, role: String): [UserProfile!]!
  }

  input ProductInput {
    sku: String
    name: String!
    category: String!
    stock: Int
    min_stock: Int
    location: String
    price: Float
  }

  input CustomerInput {
    code: String
    name: String!
    type: String!
    email: String
    phone: String
    status: String
  }

  input OrderInput {
    order_number: String
    customer_name: String!
    status: String
    priority: String
    total_items: Int
    total_value: Float
  }

  input PickingTaskInput {
    task_number: String
    order_number: String!
    assigned_to: String!
    zone: String!
    status: String
    total_items: Int
    picked_items: Int
  }

  input StaffInput {
    name: String!
    role: String!
    zone: String
    status: String
  }

  type Mutation {
    # Products
    createProduct(input: ProductInput!): Product!
    updateProduct(slug: String!, input: ProductInput!): Product!
    deleteProduct(slug: String!): Boolean!
    deleteProducts(slugs: [String!]!): Boolean!

    # Customers
    createCustomer(input: CustomerInput!): Customer!
    updateCustomer(slug: String!, input: CustomerInput!): Customer!
    deleteCustomer(slug: String!): Boolean!

    # Orders
    createOrder(input: OrderInput!): Order!
    updateOrder(slug: String!, input: OrderInput!): Order!
    deleteOrder(slug: String!): Boolean!
    deleteOrders(slugs: [String!]!): Boolean!

    # Picking
    createPickingTask(input: PickingTaskInput!): PickingTask!
    updatePickingTask(slug: String!, input: PickingTaskInput!): PickingTask!
    deletePickingTask(slug: String!): Boolean!

    # Staff
    createStaff(input: StaffInput!): Staff!
    updateStaff(slug: String!, input: StaffInput!): Staff!
    deleteStaff(slug: String!): Boolean!
    deleteStaffMembers(slugs: [String!]!): Boolean!
  }
`;
