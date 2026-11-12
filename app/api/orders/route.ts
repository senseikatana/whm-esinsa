import { handleGet, handlePost } from "../helper";

export const GET = () => handleGet("orders");
export const POST = (request: Request) => handlePost("orders", request);
