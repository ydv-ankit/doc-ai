# AI Document Assistant

An intelligent document assistant built with Next.js that allows you to upload PDF documents, get automatic summaries, and ask questions about your documents using AI-powered retrieval augmented generation (RAG).

## Features

- 📄 **PDF Document Upload** - Drag and drop or select PDF files (up to 10MB)
- 🤖 **AI-Powered Summarization** - Automatic document summaries using GPT-3.5-turbo
- 💬 **Interactive Q&A** - Ask questions about your documents and get accurate answers using RAG
- 📚 **Document History** - View and manage all uploaded documents
- 💾 **Chat History** - Persistent chat history per document stored in localStorage
- 🌓 **Dark/Light Mode** - Toggle between themes for comfortable viewing

## Tech Stack

- **Framework**: Next.js 15 (App Router) with React 19
- **AI/ML**: LangChain, OpenAI (GPT-3.5-turbo), OpenAI Embeddings
- **Vector Database**: Pinecone
- **Document Processing**: PDF parsing and text chunking
- **Styling**: Tailwind CSS with shadcn/ui components
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- OpenAI API key
- Pinecone API key and index

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd doc-ai
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_pinecone_index_name
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. **Upload**: Upload a PDF document through the drag-and-drop interface
2. **Processing**: The document is parsed, split into chunks, and embedded into Pinecone vector database
3. **Summary**: An AI-generated summary is displayed automatically
4. **Q&A**: Ask questions about the document - the system retrieves relevant chunks and generates accurate answers using RAG

## Project Structure

```
doc-ai/
├── app/
│   ├── api/
│   │   ├── question/     # Q&A endpoint
│   │   └── upload/       # Document upload endpoint
│   └── page.tsx          # Main page
├── components/
│   ├── chat-interface.tsx    # Chat UI component
│   ├── document-history.tsx  # Document sidebar
│   └── ui/                   # shadcn/ui components
└── lib/
    ├── types.ts          # TypeScript types
    └── utils.ts          # Utility functions
```

## Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
