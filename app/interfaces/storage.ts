// ==================== Storage ====================
export interface UploadResult {
	url: string | null;
	key: string | null;
	error: string | null;
}

export interface DownloadResult {
	blob: Blob | null;
	url: string | null;
	error: string | null;
}
