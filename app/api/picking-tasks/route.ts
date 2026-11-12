import { handleGet, handlePost } from "../helper";

export const GET = () => handleGet("picking");
export const POST = (request: Request) => handlePost("picking", request);
