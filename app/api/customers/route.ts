import { withAuth, withWriteAuth } from "../../lib/api-auth";
import { handleGet, handlePost } from "../helper";

export const GET = withAuth(() => handleGet("customers"));
export const POST = withWriteAuth((request: Request) => handlePost("customers", request));
