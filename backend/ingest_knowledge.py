import os

from dotenv import load_dotenv
from llama_index.core import (
    SimpleDirectoryReader,
    StorageContext,
    VectorStoreIndex,
)
from llama_index.vector_stores.postgres import PGVectorStore

# Load environment variables (Neon DB credentials and OpenAI Key)
load_dotenv()

def ingest_data():
    print("Loading medical documents from /data folder...")
    # 1. Load documents from the 'data' directory
    documents = SimpleDirectoryReader("data").load_data()
    for document in documents:
        document.metadata = {**document.metadata, "doc_type": "guideline"}
    print(f"Loaded {len(documents)} document(s).")

    print("Connecting to Neon PostgreSQL...")
    # 2. Connect to Neon DB and specify the pgvector table name
    vector_store = PGVectorStore.from_params(
        database=os.getenv("POSTGRES_DB", "neondb"),
        host=os.getenv("POSTGRES_HOST"),
        password=os.getenv("POSTGRES_PASSWORD"),
        port=os.getenv("POSTGRES_PORT", 5432),
        user=os.getenv("POSTGRES_USER"),
        table_name="medical_knowledge_base_v2",
        embed_dim=384,    )

    # 3. Setup LlamaIndex storage context
    storage_context = StorageContext.from_defaults(vector_store=vector_store)

    print("Generating embeddings via OpenAI and saving to Neon DB...")
    # 4. Chunk the text, generate embeddings, and store them in PostgreSQL
    index = VectorStoreIndex.from_documents(
        documents, 
        storage_context=storage_context,
        show_progress=True
    )
    
    print("✅ Knowledge Base Successfully Assembled and Stored in Neon DB!")


def ingest_patient_report(file_path: str, user_id: str):
    """Parses a patient's uploaded PDF report, tags it, and saves to Neon DB."""
    
    # 1. Read the uploaded PDF
    documents = SimpleDirectoryReader(input_files=[file_path]).load_data()
    
    # 2. Crucial Step: Attach the user_id as metadata to every chunk of the document
    for doc in documents:
        doc.metadata = {"user_id": user_id, "doc_type": "patient_report"}
        
    # 3. Connect to Neon DB
    vector_store = PGVectorStore.from_params(
        # ... (same Neon DB connection parameters as before) ...
        table_name="medical_knowledge_base",
        embed_dim=1536
    )
    
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    
    # 4. Generate embeddings and store
    VectorStoreIndex.from_documents(documents, storage_context=storage_context)
    print(f"✅ Patient report securely vectorized for User ID: {user_id}")

if __name__ == "__main__":
    # Ensure psycopg2 is installed for Postgres connections
    ingest_data()