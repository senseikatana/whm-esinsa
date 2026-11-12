import { handleDelete, handlePut } from "../../helper";

export const PUT = (request: Request, { params }: { params: Promise<{ id: string }> }) =>
	params.then(({ id }) => handlePut("picking", id, request));

export const DELETE = (_request: Request, { params }: { params: Promise<{ id: string }> }) =>
	params.then(({ id }) => handleDelete("picking", id));
