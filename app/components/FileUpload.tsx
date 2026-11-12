"use client";

import { Download, File, Loader2, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import type { FileUploadProps, UploadedFile } from "../interfaces";
import { deleteFile, downloadFile, uploadFile } from "../lib/storage";

export default function FileUpload({ onUpload, className }: FileUploadProps) {
	const [files, setFiles] = useState<UploadedFile[]>([]);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const fileList = e.target.files;
		if (!fileList?.length) return;

		setUploading(true);
		setError(null);

		for (const file of Array.from(fileList)) {
			const result = await uploadFile(file);

			if (result.error) {
				setError(result.error);
			} else if (result.url && result.key) {
				const newFile: UploadedFile = {
					name: file.name,
					url: result.url,
					key: result.key,
					size: file.size,
				};
				setFiles((prev) => [...prev, newFile]);
				onUpload?.(result.url, result.key);
			}
		}

		setUploading(false);
		if (inputRef.current) inputRef.current.value = "";
	};

	const handleDownload = async (key: string, name: string) => {
		const result = await downloadFile(key);
		if (result.url) {
			const a = document.createElement("a");
			a.href = result.url;
			a.download = name;
			a.click();
			URL.revokeObjectURL(result.url);
		}
	};

	const handleDelete = async (key: string) => {
		const result = await deleteFile(key);
		if (!result.error) {
			setFiles((prev) => prev.filter((f) => f.key !== key));
		}
	};

	const formatSize = (bytes: number): string => {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	};

	return (
		<div className={className}>
			{/* Upload area */}
			<div
				onClick={() => inputRef.current?.click()}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
				}}
				role="button"
				tabIndex={0}
				className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-8 text-center cursor-pointer transition"
			>
				<input ref={inputRef} type="file" multiple onChange={handleUpload} className="hidden" />
				{uploading ? (
					<Loader2 size={32} className="text-indigo-400 mx-auto mb-3 animate-spin" />
				) : (
					<Upload size={32} className="text-slate-500 mx-auto mb-3" />
				)}
				<p className="text-sm text-slate-400">
					{uploading ? "Subiendo archivos…" : "Arrastra archivos o haz clic para seleccionar"}
				</p>
				<p className="text-xs text-slate-600 mt-1">Imágenes, documentos, archivos de almacén</p>
			</div>

			{/* Error */}
			{error && (
				<div className="mt-3 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-sm text-rose-400">
					{error}
				</div>
			)}

			{/* File list */}
			{files.length > 0 && (
				<div className="mt-4 space-y-2">
					{files.map((file) => (
						<div
							key={file.key}
							className="flex items-center justify-between bg-[#050811] border border-slate-800 rounded-xl p-3"
						>
							<div className="flex items-center gap-3 min-w-0">
								<File size={18} className="text-indigo-400 shrink-0" />
								<div className="min-w-0">
									<p className="text-sm text-slate-200 truncate">{file.name}</p>
									<p className="text-xs text-slate-500">{formatSize(file.size)}</p>
								</div>
							</div>
							<div className="flex items-center gap-1 shrink-0">
								<button
									type="button"
									onClick={() => handleDownload(file.key, file.name)}
									className="p-1.5 text-slate-400 hover:text-indigo-400 rounded transition"
									title="Descargar"
								>
									<Download size={14} />
								</button>
								<button
									type="button"
									onClick={() => handleDelete(file.key)}
									className="p-1.5 text-slate-400 hover:text-rose-400 rounded transition"
									title="Eliminar"
								>
									<Trash2 size={14} />
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
