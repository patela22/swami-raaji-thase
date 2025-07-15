# Data Directory

Place your BAPS Satsang PDF files in this directory. The ingest script will process all PDF files found in this directory and its subdirectories.

## File Structure

```
data/
├── README.md
├── scripture1.pdf
├── scripture2.pdf
└── subdirectory/
    └── scripture3.pdf
```

## Supported Formats

- PDF files only
- Text-based PDFs work best (scanned PDFs may not work well)

## Processing

The ingest script will:

1. Extract text from each PDF
2. Split text into ~500-token chunks
3. Generate embeddings using OpenAI's text-embedding-3-small
4. Store embeddings in the Supabase database

Run `pnpm ingest` to process all PDF files in this directory.
