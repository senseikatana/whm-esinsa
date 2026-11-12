import type { PickingTask } from "../../interfaces";
import { createCrudService } from "./base";

export const pickingService = createCrudService<PickingTask>("picking");
