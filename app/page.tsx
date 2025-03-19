"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { ChatInterface } from "@/components/chat-interface";
import { DocumentMetadata } from "@/lib/types";
import { DocumentHistory } from "@/components/document-history";
import { ModeToggle } from "@/components/theme-toggle";

export default function Home() {
	const [loading, setLoading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(false);
	const [error, setError] = useState<string>("");
	const [summary, setSummary] = useState<string>("");
	const [currentDocument, setCurrentDocument] =
		useState<DocumentMetadata | null>(null);
	const [documents, setDocuments] = useState<DocumentMetadata[]>([]);

	const handleMessage = async (message: string, documentId: string) => {
		try {
			setLoading(true);
			const response = await fetch("/api/question", {
				method: "POST",
				body: JSON.stringify({
					question: message,
					documentId,
				}),
			});
			if (!response.ok) {
				throw new Error("Failed to fetch answer");
			}
			const data = await response.json();
			return data.answer;
		} catch (error) {
			setError(
				error instanceof Error ? error.message : "An unknown error occurred"
			);
			return "An error occurred while processing your request.";
		} finally {
			setLoading(false);
		}
	};

	const handleDocumentSelect = (documentId: string) => {
		const selectedDocument = documents.find((doc) => doc.id === documentId);
		if (selectedDocument) {
			setCurrentDocument(selectedDocument);
			setSummary(selectedDocument.summary);
		}
	};

	const onDrop = useCallback(async (acceptedFiles: File[]) => {
		try {
			setError("");
			setUploadProgress(true);
			const formData = new FormData();
			formData.append("file", acceptedFiles[0]);
			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});
			if (!response.ok) {
				throw new Error("Failed to upload document");
			}
			const data = await response.json();
			setSummary(data.summary);

			const newDoc: DocumentMetadata = {
				id: data.documentId,
				filename: acceptedFiles[0].name,
				uploadAt: new Date(),
				summary: data.summary,
				pageCount: data.pageCount,
				fileSize: acceptedFiles[0].size,
			};

			setDocuments((prevDocs) => [...prevDocs, newDoc]);
			setCurrentDocument(newDoc);
		} catch (error) {
			setError(
				error instanceof Error
					? error.message
					: "An error occurred while processing the document."
			);
		} finally {
			setUploadProgress(false);
			setLoading(false);
		}
	}, []);
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: { "application/pdf": [".pdf"] },
		maxSize: 10 * 1024 * 1024, // 10 MB
	});
	return (
		<div className="container mx-auto p-4">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-center font-bold">AI Document Assistant</h1>
				<ModeToggle />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="md:col-span-2">
					<Card className="p-6 mb-8">
						<div
							{...getRootProps()}
							className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
								isDragActive
									? "border-blue-500"
									: "border-gray-300 dark:border-gray-700"
							}`}>
							<input {...getInputProps()} />
							{uploadProgress ? (
								<div className="flex items-center justify-center gap-2">
									<Loader2 className="animate-spin size-4" />
									<p>Processing document...</p>
								</div>
							) : (
								<p>Drag n drop files here, or click to select files</p>
							)}
						</div>
					</Card>
					{error && (
						<div className="bg-red-50 text-red-500 p-4 rounded-lg mb-4">
							{error}
						</div>
					)}
					{summary && (
						<Card className="p-4 mb-8">
							<h2 className="text-xl font-semibold mb-4">Document Summary</h2>
							<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
								{summary}
							</p>
						</Card>
					)}
					{/* chat interface */}
					<ChatInterface
						onSendMessage={handleMessage}
						loading={loading}
						currentDocument={currentDocument}
					/>
				</div>
				<div className="md:sticky md:top-4 h-fit">
					<DocumentHistory
						documents={documents}
						onSelectDocument={handleDocumentSelect}
						currentDocumentId={currentDocument?.id}
					/>
				</div>
			</div>
		</div>
	);
}
