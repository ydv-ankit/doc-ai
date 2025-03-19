import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { NextResponse } from "next/server";

const pinecone = new Pinecone({
	apiKey: process.env.PINECONE_API_KEY!,
});

export async function POST(req: Request) {
	try {
		const { question, documentId } = await req.json();
		if (!question?.trim() || !documentId) {
			return NextResponse.json(
				{ error: "Question and documentId are required." },
				{ status: 400 }
			);
		}
		const embeddings = new OpenAIEmbeddings({
			openAIApiKey: process.env.OPENAI_API_KEY!,
		});
		const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);
		const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
			pineconeIndex: index,
			filter: { documentId },
		});
		const results = await vectorStore.similaritySearch(question, 4);
		if (results.length === 0) {
			return NextResponse.json(
				{ answer: "I wasn't able to find relevant answers to your questions." },
				{ status: 404 }
			);
		}
		const contentText = results.map((r) => r.pageContent).join("\n");
		const openai = new ChatOpenAI({
			apiKey: process.env.OPENAI_API_KEY!,
			temperature: 0.5,
			modelName: "gpt-3.5-turbo",
		});
		const prompt = `You are a help assistant. Answer the question based on the context provided below, please answer the question accurately and concisely. If context doesn't contain relevant information, say "I don't know".
        Context: ${contentText}
        Question: ${question}
        Answer:`;

		const response = await openai.invoke(prompt);
		return NextResponse.json({
			answer: response.content,
		});
	} catch (error) {
		return NextResponse.json(
			{
				error: "An error occurred while processing your request.",
			},
			{ status: 500 }
		);
	}
}
