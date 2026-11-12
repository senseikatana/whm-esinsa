import type { DownloadResult, UploadResult } from "../interfaces";
import insforge from "./insforge";

export type { DownloadResult, UploadResult } from "../interfaces";

const BUCKET_NAME = "warehouse-files";

/**
 * Upload a file to the warehouse-files bucket.
 * Returns the URL and key for database storage.
 */
export async function uploadFile(file: File, path?: string): Promise<UploadResult> {
	try {
		const key = path || `uploads/${Date.now()}-${file.name}`;

		const { data, error } = await insforge.storage.from(BUCKET_NAME).upload(key, file);

		if (error) return { url: null, key: null, error: error.message };

		return {
			url: data?.url ?? null,
			key: data?.key ?? null,
			error: null,
		};
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Error uploading file";
		return { url: null, key: null, error: message };
	}
}

/**
 * Upload a file with an auto-generated key.
 */
export async function uploadFileAuto(file: File): Promise<UploadResult> {
	try {
		const { data, error } = await insforge.storage.from(BUCKET_NAME).uploadAuto(file);

		if (error) return { url: null, key: null, error: error.message };

		return {
			url: data?.url ?? null,
			key: data?.key ?? null,
			error: null,
		};
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Error uploading file";
		return { url: null, key: null, error: message };
	}
}

/**
 * Download a file by its key.
 * Returns a blob and an object URL for display.
 */
export async function downloadFile(key: string): Promise<DownloadResult> {
	try {
		const { data, error } = await insforge.storage.from(BUCKET_NAME).download(key);

		if (error || !data) return { blob: null, url: null, error: error?.message ?? "No data" };

		const url = URL.createObjectURL(data);
		return { blob: data, url, error: null };
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Error downloading file";
		return { blob: null, url: null, error: message };
	}
}

/**
 * Delete a file by its key.
 */
export async function deleteFile(key: string): Promise<{ error: string | null }> {
	try {
		const { error } = await insforge.storage.from(BUCKET_NAME).remove(key);

		if (error) return { error: error.message };
		return { error: null };
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Error deleting file";
		return { error: message };
	}
}
