/** Shared upload limits (safe to import from client and server code). */
export const MAX_FILE_BYTES = 5 * 1024 * 1024;

/** Types safe to render inline in the browser. Everything else downloads. */
export const INLINE_SAFE_TYPES = new Set([
	"image/png",
	"image/jpeg",
	"image/webp",
	"image/gif",
	"application/pdf",
]);
