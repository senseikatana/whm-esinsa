import type { Staff } from "../../interfaces";
import { createCrudService } from "./base";

export const staffService = createCrudService<Staff>("staff");
