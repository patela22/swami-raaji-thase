-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the embeddings table
CREATE TABLE IF NOT EXISTS embeddings (
  id TEXT PRIMARY KEY,
  scripture TEXT NOT NULL,
  page TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the logs table
CREATE TABLE IF NOT EXISTS logs (
  id TEXT PRIMARY KEY,
  prompt TEXT NOT NULL,
  answer TEXT NOT NULL,
  citations JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the vector similarity function
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS embeddings_scripture_idx ON embeddings(scripture);
CREATE INDEX IF NOT EXISTS embeddings_created_at_idx ON embeddings(created_at);
CREATE INDEX IF NOT EXISTS logs_created_at_idx ON logs(created_at); 