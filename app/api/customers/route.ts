import type { NextResponse } from "next/server";
import { handleGet, handlePost } from "../helper";

export function GET(): Promise<
	| NextResponse<{
			success: boolean;
			error: string;
	  }>
	| NextResponse<{
			success: boolean;
			data: {
				items: any[];
			};
	  }>
> {
	return handleGet("customers");
}

export function POST(request: Request): Promise<
	| NextResponse<{
			success: boolean;
			error: string;
	  }>
	| NextResponse<{
			success: boolean;
			data: null;
	  }>
> {
	return handlePost("customers", request);
}
