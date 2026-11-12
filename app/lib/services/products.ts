import type { Product } from "../../interfaces";
import { createCrudService } from "./base";

export const productsService = createCrudService<Product>("products");
