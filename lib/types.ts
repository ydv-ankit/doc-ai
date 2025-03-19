export interface DocumentMetadata {
	id: string;
	filename: string;
	uploadAt: Date;
	pageCount: number;
	summary: string;
	fileSize: number;
}

export interface ChatMessage {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
    documentId: string;
}
