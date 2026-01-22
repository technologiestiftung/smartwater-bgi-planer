"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store";
import { TrashIcon } from "@phosphor-icons/react";
import { useCallback, useState } from "react";

interface FileUploadZoneProps {
	accept?: string;
	onFilesChange?: (files: File[]) => void;
	className?: string;
	files?: File[];
}

export function FileUploadZone({
	accept = ".zip",
	onFilesChange,
	className,
	files = [],
}: FileUploadZoneProps) {
	const [isDragging, setIsDragging] = useState(false);

	const uploadError = useUiStore((state) => state.uploadError);
	const setUploadError = useUiStore((state) => state.setUploadError);
	const clearUploadStatus = useUiStore((state) => state.clearUploadStatus);

	const handleFiles = useCallback(
		(fileList: FileList | null) => {
			if (!fileList || fileList.length === 0) return;

			const file = fileList[0];

			if (!file.name.toLowerCase().endsWith(".zip")) {
				setUploadError(
					"Diese Datei ist nicht kompatibel mit dem BGI Planer. Bitte wählen Sie eine .zip Datei, der von BGI Planer erstellt wurde.",
				);
				return;
			}

			clearUploadStatus();

			if (onFilesChange) {
				onFilesChange([file]);
			}
		},
		[onFilesChange, setUploadError, clearUploadStatus],
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
			handleFiles(e.dataTransfer.files);
		},
		[handleFiles],
	);

	const handleRemoveFile = useCallback(() => {
		clearUploadStatus();
		if (onFilesChange) {
			onFilesChange([]);
		}
	}, [onFilesChange, clearUploadStatus]);

	const handleFileSelect = useCallback(() => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = accept;
		input.multiple = false;
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

	const currentFile = files[0];

	return (
		<div className={cn("flex flex-col gap-4", className)}>
			{!currentFile ? (
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
						importiert werden.
					</p>
				</div>
			) : (
				<div
					className="UploadSection-root border-primary flex cursor-pointer flex-col gap-2 border-2 border-dashed p-4 text-center transition-colors"
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					onClick={handleFileSelect}
				>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3 overflow-hidden">
							<div className="text-primary flex items-center gap-2 overflow-hidden italic">
								<p className="truncate">{currentFile.name}</p>
								<p className="text-muted-foreground">
									{formatFileSize(currentFile.size)}
								</p>
							</div>
						</div>
						<Button
							variant="ghost"
							onClick={(e) => {
								e.stopPropagation();
								handleRemoveFile();
							}}
							className="text-primary shrink-0"
						>
							<TrashIcon className="size-6" />
						</Button>
					</div>
				</div>
			)}

			{uploadError && (
				<div className="bg-destructive/10 border-destructive flex flex-col gap-2 border-2 border-dashed p-4 text-center">
					<p className="text-destructive text-sm">{uploadError}</p>
				</div>
			)}
		</div>
	);
}
