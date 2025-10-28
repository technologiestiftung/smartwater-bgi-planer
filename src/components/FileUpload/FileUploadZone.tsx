"use client";

import { useCallback, useState } from "react";
import { TrashIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileUploadZoneProps, InvalidFile, UploadedFile } from "@/types";

export function FileUploadZone({
	accept = ".zip,.json",
	onFilesChange,
	className,
}: FileUploadZoneProps) {
	const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
	const [isDragging, setIsDragging] = useState(false);
	const [invalidFiles, setInvalidFiles] = useState<InvalidFile[]>([]);

	const validateFileType = useCallback(
		(file: File): boolean => {
			const acceptedExtensions = accept.split(",").map((ext) => ext.trim());
			const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
			return acceptedExtensions.includes(fileExtension);
		},
		[accept],
	);

	const handleFiles = useCallback(
		(files: FileList | null) => {
			if (!files || files.length === 0) return;

			const fileArray = Array.from(files);
			const validFiles: File[] = [];
			const invalid: InvalidFile[] = [];

			fileArray.forEach((file) => {
				if (!validateFileType(file)) {
					invalid.push({
						name: file.name,
						reason: `Diese Datei ist nicht kompatibel mit BGI Planer. Bitte wählen Sie eine .zip- oder .json-Datei, die von BGI Planer erstellt wurde.`,
					});
				} else {
					validFiles.push(file);
				}
			});

			setInvalidFiles(invalid);

			if (validFiles.length > 0) {
				const newUploadedFiles = validFiles.map((file) => ({
					file,
					id: `${file.name}-${Date.now()}-${Math.random()}`,
				}));

				setUploadedFiles((prev) => [...prev, ...newUploadedFiles]);

				if (onFilesChange) {
					onFilesChange([...uploadedFiles.map((uf) => uf.file), ...validFiles]);
				}
			}

			// Clear invalid files after 5 seconds
			if (invalid.length > 0) {
				setTimeout(() => {
					setInvalidFiles([]);
				}, 5000);
			}
		},
		[onFilesChange, uploadedFiles, validateFileType],
	);

	const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragging(false);

			const files = e.dataTransfer.files;
			handleFiles(files);
		},
		[handleFiles],
	);

	const handleRemoveFile = useCallback(
		(id: string) => {
			setUploadedFiles((prev) => {
				const updated = prev.filter((uf) => uf.id !== id);
				if (onFilesChange) {
					onFilesChange(updated.map((uf) => uf.file));
				}
				return updated;
			});
		},
		[onFilesChange],
	);

	const handleFileSelect = useCallback(() => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = accept;
		input.multiple = true;
		input.onchange = (e) => {
			const target = e.target as HTMLInputElement;
			handleFiles(target.files);
		};
		input.click();
	}, [accept, handleFiles]);

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
	};

	return (
		<div className={cn("flex flex-col gap-4", className)}>
			{uploadedFiles.length === 0 && (
				<div
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					onClick={handleFileSelect}
					className={cn(
						"UploadSection-root border-primary bg-light flex cursor-pointer flex-col gap-2 border-2 border-dashed p-4 text-center transition-colors",
						isDragging && "bg-primary/10 border-primary/50",
					)}
				>
					<p>
						Datei hierher ziehen oder{" "}
						<span className="font-bold underline">Datei auswählen.</span>
					</p>
					<p>
						Es können Projektdateien <span className="font-bold">(.zip)</span>{" "}
						und Konfigurationsdateien <span className="font-bold">(.json)</span>{" "}
						importiert werden.
					</p>
				</div>
			)}

			{uploadedFiles.length > 0 && (
				<div
					className="UploadSection-root border-primary flex cursor-pointer flex-col gap-2 border-2 border-dashed p-4 text-center transition-colors"
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					onClick={handleFileSelect}
				>
					{uploadedFiles.map((uploadedFile) => (
						<div
							key={uploadedFile.id}
							className="flex items-center justify-between"
						>
							<div className="flex items-center gap-3 overflow-hidden">
								<div className="text-primary flex items-center gap-2 overflow-hidden italic">
									<p className="truncate">{uploadedFile.file.name}</p>
									<p className="text-muted-foreground">
										{formatFileSize(uploadedFile.file.size)}
									</p>
								</div>
							</div>
							<Button
								variant="ghost"
								onClick={(e) => {
									e.stopPropagation();
									handleRemoveFile(uploadedFile.id);
								}}
								className="text-primary shrink-0"
							>
								<TrashIcon className="size-6" />
							</Button>
						</div>
					))}
				</div>
			)}

			{invalidFiles.length > 0 && (
				<div className="bg-destructive/10 border-destructive flex flex-col gap-2 border-2 border-dashed p-4 text-center">
					{invalidFiles.map((invalidFile, index) => (
						<div key={index} className="flex items-start justify-center gap-3">
							<div className="flex flex-col gap-1">
								<p className="text-destructive font-bold">{invalidFile.name}</p>
								<p className="text-destructive/80 text-sm">
									{invalidFile.reason}
								</p>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
