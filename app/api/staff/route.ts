import { withAuth, withWriteAuth } from "../../lib/api-auth";
import { handleGet, handlePost } from "../helper";

export const GET = withAuth(() => handleGet("staff"));
export const POST = withWriteAuth((request: Request) => handlePost("staff", request));
