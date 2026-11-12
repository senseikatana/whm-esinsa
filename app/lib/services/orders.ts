import type { Order } from "../../interfaces";
import { createCrudService } from "./base";

export const ordersService = createCrudService<Order>("orders");
