import { handleGet, handlePost } from "../helper";

export const GET = () => handleGet("products");
export const POST = (request: Request) => handlePost("products", request);
