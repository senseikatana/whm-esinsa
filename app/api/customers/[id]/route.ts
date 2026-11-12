import { withWriteAuth } from "../../../lib/api-auth";
import { handleDelete, handlePut } from "../../helper";

export const PUT = withWriteAuth(
	(request: Request, { params }: { params: Promise<{ id: string }> }) =>
		params.then(({ id }) => handlePut("customers", id, request)),
);

export const DELETE = withWriteAuth(
	(_request: Request, { params }: { params: Promise<{ id: string }> }) =>
		params.then(({ id }) => handleDelete("customers", id)),
);
