import { ChatMessage, DocumentMetadata } from "@/lib/types";
import { ReactNode, useEffect, useState } from "react";
import { Card } from "./ui/card";
import { FileTextIcon, Loader2, Send } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";

interface ChatInterfaceProps {
	onSendMessage: (message: string, documentId: string) => Promise<string>;
	loading: boolean;
	currentDocument?: DocumentMetadata | null;
}

const getChatHistory = (documentId: string) => {
	const history = localStorage.getItem(`chat-history-${documentId}`);
	return history ? JSON.parse(history) : [];
};

const saveChatHistory = (documentId: string, messages: ChatMessage[]) => {
	localStorage.setItem(`chat-history-${documentId}`, JSON.stringify(messages));
};

export const ChatInterface = ({
	onSendMessage,
	loading,
	currentDocument,
}: ChatInterfaceProps): ReactNode | Promise<ReactNode> => {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [input, setInput] = useState<string>("");
	console.log("messages", messages);

	useEffect(() => {
		if (currentDocument?.id) {
			const history = getChatHistory(currentDocument.id);
			setMessages(history);
		} else {
			setMessages([]);
		}
	}, [currentDocument]);

	useEffect(() => {
		if (currentDocument?.id) {
			saveChatHistory(currentDocument.id, messages);
		}
	}, [messages, currentDocument]);

	const handleSend = async () => {
		if (!input.trim() || loading || !currentDocument) return;
		const userMessage: ChatMessage = {
			id: crypto.randomUUID(),
			role: "user",
			timestamp: new Date(),
			content: input,
			documentId: currentDocument.id,
		};

		setMessages((prev) => [...prev, userMessage]);
		setInput("");

		// get AI response
		const AIResponse = await onSendMessage(input, currentDocument.id);
		const AIMessage: ChatMessage = {
			id: crypto.randomUUID(),
			role: "assistant",
			timestamp: new Date(),
			content: AIResponse,
			documentId: currentDocument.id,
		};
		setMessages((prev) => [...prev, AIMessage]);
	};

	const clearHistory = () => {
		if (currentDocument?.id) {
			localStorage.removeItem(`chat-history-${currentDocument.id}`);
			setMessages([]);
		}
	};

	return (
		<Card className="h-[500px] flex flex-col p-0 overflow-hidden">
			{currentDocument ? (
				<div className="p-3 border-b flex items-center justify-between bg-muted/50">
					<div className="flex items-center gap-2">
						<FileTextIcon className="size-4 text-muted-foreground" />
						<span className="text-sm text-muted-foreground">
							Current Document: {currentDocument.filename}
						</span>
					</div>
					{messages.length > 0 && (
						<Button
							variant="ghost"
							className="text-muted-foreground hover:text-destructive"
							onClick={clearHistory}>
							Clear history
						</Button>
					)}
				</div>
			) : (
				<div className="p-3 border-b bg-yellow-500/10 text-yellow-900 dark:text-yellow-300 dark:bg-yellow-900/10 text-sm">
					Please upload or select a document to start asking questions.
				</div>
			)}
			<div className="flex-1 overflow-hidden">
				<ScrollArea className="h-full p-4 gap-4">
					<div className="space-y-4">
						{messages.map((message) => (
							<div
								key={message.id}
								className={`flex ${
									message.role === "user" ? "justify-end" : "justify-start"
								}`}>
								<div
									className={`max-w-[80%] rounded-lg p-3 ${
										message.role === "user"
											? "bg-primary text-primary-foreground"
											: "bg-muted text-muted-foreground"
									}`}>
									<p className="whitespace-pre-wrap">{message.content}</p>
									<div
										className={`text-xs mt-1 ${
											message.role === "user"
												? "text-primary-foreground/70 text-end"
												: "text-muted-foreground/70"
										}`}>
										{new Date(message.timestamp).toLocaleTimeString()}
									</div>
								</div>
							</div>
						))}
					</div>
				</ScrollArea>
			</div>
			<div className="p-4 border-t">
				<div className="flex gap-2">
					<Input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
						placeholder={
							currentDocument
								? "Ask a question..."
								: "Please select a document to ask questions..."
						}
						disabled={loading || !currentDocument}
					/>
					<Button onClick={handleSend}>
						{loading ? <Loader2 className="animate-spin" /> : <Send />}
					</Button>
				</div>
			</div>
		</Card>
	);
};
