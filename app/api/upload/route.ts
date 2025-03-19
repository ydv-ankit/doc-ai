import { Pinecone } from "@pinecone-database/pinecone";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { NextResponse } from "next/server";

const pinecone = new Pinecone({
	apiKey: process.env.PINECONE_API_KEY!,
});

export async function POST(req: Request) {
	try {
		const formData = await req.formData();
		const file = formData.get("file") as File;
		if (!file) {
			return new Response("No file provided", { status: 400 });
		}
		// generate a unique ID for the file
		const documentId = crypto.randomUUID();
		// convert file to blob
		const fileBlob = new Blob([await file.arrayBuffer()], { type: file.type });
		// load and parse the file
		const loader = new PDFLoader(fileBlob);
		const documents = await loader.load();

		// split text into chunks
		const textSplitter = new RecursiveCharacterTextSplitter({
			chunkSize: 1000,
			chunkOverlap: 200,
		});
		const splitDocs = await textSplitter.splitDocuments(documents);
		console.log("Split documents:", splitDocs);
		console.log("Split document[0]", splitDocs[0].pageContent);

		// add unique ID to each chunk
		const docsWithId = splitDocs.map((doc) => ({
			...doc,
			metadata: {
				...doc.metadata,
				documentId,
			},
		}));

		// generate summary
		const openai = new ChatOpenAI({
			apiKey: process.env.OPENAI_API_KEY!,
			temperature: 0.5,
			modelName: "gpt-3.5-turbo",
		});

		const summaryPrompt = `Summarize the following document in a clear, concise manner: 
${splitDocs[0].pageContent}`;

		const openaiResponse = await openai.invoke(summaryPrompt);
		const summary = openaiResponse.content;

		// store chunks in Pinecone
		const embeddings = new OpenAIEmbeddings({
			openAIApiKey: process.env.OPENAI_API_KEY!,
		});
		const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);
		await PineconeStore.fromDocuments(docsWithId, embeddings, {
			pineconeIndex: index,
		});
		return NextResponse.json({
			summary,
			documentId,
			pageCount: documents.length,
		});
	} catch (error) {
		console.error("Error uploading file:", error);
		return new Response("Error uploading file", { status: 500 });
	}
}
