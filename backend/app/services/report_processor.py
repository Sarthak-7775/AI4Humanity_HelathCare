import os
import tempfile

from dotenv import load_dotenv

load_dotenv()

try:
    from llama_index.core import (
        Settings,
        SimpleDirectoryReader,
        StorageContext,
        VectorStoreIndex,
    )
    from llama_index.embeddings.huggingface import HuggingFaceEmbedding
    from llama_index.vector_stores.postgres import PGVectorStore

    Settings.embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-en-v1.5")
    LLAMA_INDEX_AVAILABLE = True
except Exception:  # pragma: no cover - fallback for local/offline development
    Settings = None
    SimpleDirectoryReader = None
    StorageContext = None
    VectorStoreIndex = None
    HuggingFaceEmbedding = None
    PGVectorStore = None
    LLAMA_INDEX_AVAILABLE = False


def process_and_vectorize_report(file_bytes: bytes, file_name: str, user_id: str):
    """
    Temporarily saves the uploaded PDF, extracts text, generates embeddings, 
    tags with user_id, and stores the vectors in Neon DB.
    """
    # 1. Save the uploaded file temporarily so LlamaIndex can read it
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
        temp_file.write(file_bytes)
        temp_file_path = temp_file.name

    try:
        if not LLAMA_INDEX_AVAILABLE:
            print(f"LlamaIndex dependencies are unavailable; skipping vectorization for '{file_name}'.")
            return

        # 2. Read the PDF content
        documents = SimpleDirectoryReader(input_files=[temp_file_path]).load_data()
        
        # 3. Attach the user_id as metadata to every chunk of the document
        for doc in documents:
            doc.metadata = {"user_id": user_id, "doc_type": "patient_report"}
            
        # 4. Connect to the pgvector table in Neon DB
        db_url = os.getenv("NEON_DATABASE_URL")
        if not db_url:
            raise ValueError("NEON_DATABASE_URL environment variable is missing")

        import urllib.parse
        parsed_url = urllib.parse.urlparse(db_url)

        vector_store = PGVectorStore.from_params(
            database=parsed_url.path.lstrip("/"),
            host=parsed_url.hostname,
            password=parsed_url.password,
            port=parsed_url.port or 5432,
            user=parsed_url.username,
            table_name="medical_knowledge_base_v2",
            embed_dim=384
        )
        
        storage_context = StorageContext.from_defaults(vector_store=vector_store)
        
        # 5. Generate embeddings and store them permanently
        VectorStoreIndex.from_documents(documents, storage_context=storage_context)
        print(f"✅ Patient report '{file_name}' securely vectorized for User ID: {user_id}")
        
    finally:
        # 6. Clean up the temporary file from the server
        os.remove(temp_file_path)