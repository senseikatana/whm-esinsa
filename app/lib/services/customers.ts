import type { Customer } from "../../interfaces";
import { createCrudService } from "./base";

export const customersService = createCrudService<Customer>("customers");
