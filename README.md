# Swami Raaji Thase - BAPS Satsang Chatbot

A Next.js RAG (Retrieval-Augmented Generation) chatbot that answers BAPS Satsang questions by grounding GPT-4o on scripture PDFs. The chatbot provides professional, respectful responses based on BAPS teachings and spiritual practices.

## Features

- **RAG-powered responses**: Grounded in scripture PDFs using vector embeddings
- **Multilingual support**: Responds in English or Gujarati based on user input
- **Real-time streaming**: Live token streaming for responsive chat experience
- **Citation tracking**: Provides source references for all responses
- **Professional tone**: Maintains appropriate spiritual discourse
- **Content filtering**: Rejects non-satsang related questions
- **Exchange logging**: Logs all conversations for analysis

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **Backend**: Next.js API Routes (Edge Runtime)
- **AI**: OpenAI GPT-4o, text-embedding-3-large
- **Database**: Supabase with pgvector for vector similarity search
- **PDF Processing**: LangChain text splitters, pdf-parse
- **Deployment**: Vercel

## Project Structure

```
├── app/
│   ├── components/
│   │   ├── ChatInput.tsx      # Landing page input
│   │   ├── ChatMessage.tsx    # Individual message display
│   │   └── ChatWindow.tsx     # Main chat interface
│   ├── api/
│   │   └── chat/
│   │       └── route.ts       # Edge runtime chat API
│   ├── globals.css            # Tailwind styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main page
├── lib/
│   ├── supabase.ts            # Database client
│   ├── embeddings.ts          # OpenAI embeddings
│   ├── retriever.ts           # Vector DB queries
│   └── logger.ts              # Exchange logging
├── scripts/
│   └── ingest.ts              # PDF ingestion CLI
├── prisma/
│   └── schema.prisma          # Database schema
├── data/                      # PDF files directory
└── .env.local                 # Environment variables
```

## Setup

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Environment Variables

Create `.env.local` with the following variables:

```env
OPENAI_API_KEY=your_openai_api_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
DATABASE_URL=your_supabase_database_url_here
```

### 3. Database Setup

#### Option A: Using Supabase Dashboard

1. Create a new Supabase project
2. Enable the `pgvector` extension in the SQL editor:

   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

3. Create the embeddings table:

   ```sql
   CREATE TABLE embeddings (
     id TEXT PRIMARY KEY,
     scripture TEXT NOT NULL,
     page TEXT NOT NULL,
     content TEXT NOT NULL,
     embedding vector(1536),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

4. Create the logs table:

   ```sql
   CREATE TABLE logs (
     id TEXT PRIMARY KEY,
     prompt TEXT NOT NULL,
     answer TEXT NOT NULL,
     citations JSONB NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

5. Create the vector similarity function:
   ```sql
   CREATE OR REPLACE FUNCTION match_documents(
     query_embedding vector(1536),
     match_threshold float,
     match_count int
   )
   RETURNS TABLE(
     id text,
     scripture text,
     page text,
     content text,
     similarity float
   )
   LANGUAGE plpgsql
   AS $$
   BEGIN
     RETURN QUERY
     SELECT
       embeddings.id,
       embeddings.scripture,
       embeddings.page,
       embeddings.content,
       1 - (embeddings.embedding <=> query_embedding) AS similarity
     FROM embeddings
     WHERE 1 - (embeddings.embedding <=> query_embedding) > match_threshold
     ORDER BY embeddings.embedding <=> query_embedding
     LIMIT match_count;
   END;
   $$;
   ```

#### Option B: Using Prisma

1. Install Prisma CLI:

   ```bash
   npm install -g prisma
   ```

2. Generate Prisma client:

   ```bash
   npx prisma generate
   ```

3. Push schema to database:
   ```bash
   npx prisma db push
   ```

### 4. Add PDF Files

Place your BAPS Satsang PDF files in the `data/` directory:

```bash
mkdir data
# Copy your PDF files to data/
```

### 5. Ingest PDFs

Run the ingestion script to process PDFs and generate embeddings:

```bash
pnpm ingest
```

### 6. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

### Development

```bash
# Start development server
pnpm dev

# Run ingestion script
pnpm ingest

# Build for production
pnpm build

# Start production server
pnpm start
```

### Deployment

1. **Vercel Deployment**:

   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy to production
   vercel --prod
   ```

2. **Environment Variables**: Set all required environment variables in your Vercel project settings.

3. **Database**: Ensure your Supabase database is properly configured with the required tables and functions.

## API Endpoints

### POST /api/chat

Handles chat requests with streaming responses.

**Request Body**:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "What is the importance of daily prayer in BAPS?"
    }
  ]
}
```

**Response**: Server-Sent Events stream with:

- `content`: Streaming response tokens
- `citations`: Source references
- `[DONE]`: End of stream

## Features in Detail

### Content Filtering

The chatbot automatically filters questions to ensure they're related to BAPS Satsang topics. Keywords include:

- BAPS, Satsang, Swaminarayan
- Spiritual practices, devotion, bhakti
- Scriptures, Gita, Vedas, Upanishads
- Temple, worship, meditation, prayer

### Multilingual Support

The chatbot responds in the same language as the user's question (English or Gujarati).

### Citation System

All responses include citations from the source scriptures with:

- Scripture name
- Page number
- Relevant text snippet

### Professional Tone

The AI maintains a respectful, professional tone appropriate for spiritual discourse, focusing on:

- Practical spiritual guidance
- Scriptural wisdom
- Respectful discourse
- Acknowledging limitations when uncertain

## Troubleshooting

### Common Issues

1. **PDF Processing Errors**: Ensure PDFs are text-based, not scanned images
2. **Embedding Generation**: Check OpenAI API key and rate limits
3. **Database Connection**: Verify Supabase credentials and network access
4. **Vector Search**: Ensure pgvector extension is enabled in Supabase

### Debug Mode

Enable debug logging by setting:

```env
DEBUG=true
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational and spiritual purposes. Please respect the sacred nature of BAPS teachings and use responsibly.

## Support

For issues related to:

- **Technical problems**: Check the troubleshooting section
- **BAPS content**: Consult with BAPS spiritual leaders
- **Deployment**: Refer to Vercel and Supabase documentation
