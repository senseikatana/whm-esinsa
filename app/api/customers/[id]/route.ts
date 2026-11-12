import { handleDelete, handlePut } from "../../helper";

export const PUT = (request: Request, { params }: { params: Promise<{ id: string }> }) =>
	params.then(({ id }) => handlePut("customers", id, request));

export const DELETE = (_request: Request, { params }: { params: Promise<{ id: string }> }) =>
	params.then(({ id }) => handleDelete("customers", id));
