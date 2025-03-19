import { DocumentMetadata } from "@/lib/types";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";

interface DocumentHistoryProps {
	documents: DocumentMetadata[];
	onSelectDocument: (documentId: string) => void;
	currentDocumentId?: string | null;
}

export const DocumentHistory = ({
	documents,
	onSelectDocument,
	currentDocumentId,
}: DocumentHistoryProps) => {
	return (
		<Card className="p-4">
			<h2 className="text-lg font-semibold mb-4">Document History</h2>
			{documents.length === 0 ? (
				<p className="text-sm text-muted-foreground text-center py-4">
					No documents uploaded yet.
				</p>
			) : (
				<ScrollArea className="h-[300px]">
					{documents.map((doc) => (
						<div
							key={doc.id}
							className={`p-3 rounded-lg mb-2 transition-colors ${
								currentDocumentId === doc.id
									? "bg-primary/10"
									: "hover:bg-primary/5 "
							}`}>
							<div className="flex items-center justify-between">
								<div
									className="cursor-pointer flex-1"
									onClick={() => onSelectDocument(doc.id)}>
									{doc.filename}
								</div>
								<div className="text-sm text-muted-foreground">
									{new Date(doc.uploadAt).toDateString()}
								</div>
							</div>
						</div>
					))}
				</ScrollArea>
			)}
		</Card>
	);
};
