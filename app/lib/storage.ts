import type { DownloadResult, UploadResult } from "../interfaces";
import { MAX_FILE_BYTES } from "./file-limits";

export type { DownloadResult, UploadResult } from "../interfaces";

/** Upload a file. Returns the URL the browser can use to download it again. */
export async function uploadFile(file: File): Promise<UploadResult> {
	if (file.size > MAX_FILE_BYTES) {
		return { url: null, key: null, error: "El archivo supera el límite de 5 MB" };
	}

	try {
		const body = new FormData();
		body.append("file", file);

		const response = await fetch("/api/files", { method: "POST", body });
		const payload = await response.json();

		if (!response.ok || !payload?.success) {
			return { url: null, key: null, error: payload?.error ?? "Error uploading file" };
		}

		return { url: payload.data.url, key: payload.data.key, error: null };
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Error uploading file";
		return { url: null, key: null, error: message };
	}
}

/** Upload a file with a server-generated key. */
export async function uploadFileAuto(file: File): Promise<UploadResult> {
	return uploadFile(file);
}

/** Download a file by its key and expose it as an object URL. */
export async function downloadFile(key: string): Promise<DownloadResult> {
	try {
		const response = await fetch(`/api/files/${encodeURIComponent(key)}`);
		if (!response.ok) {
			return { blob: null, url: null, error: "No se pudo descargar el archivo" };
		}

		const blob = await response.blob();
		const url = URL.createObjectURL(blob);
		return { blob, url, error: null };
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Error downloading file";
		return { blob: null, url: null, error: message };
	}
}

/** Delete a file by its key. */
export async function deleteFile(key: string): Promise<{ error: string | null }> {
	try {
		const response = await fetch(`/api/files/${encodeURIComponent(key)}`, { method: "DELETE" });
		const payload = await response.json().catch(() => null);
		if (!response.ok) return { error: payload?.error ?? "Error deleting file" };
		return { error: null };
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Error deleting file";
		return { error: message };
	}
}
