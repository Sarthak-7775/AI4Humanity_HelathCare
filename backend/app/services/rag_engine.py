import os

from llama_index.core import Settings, VectorStoreIndex
from llama_index.core.vector_stores.types import (
    FilterCondition,
    FilterOperator,
    MetadataFilter,
    MetadataFilters,
)
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.llms.openai import OpenAI
from llama_index.vector_stores.postgres import PGVectorStore

from app.schemas import ChatbotResponse

# Configure LLM to output the structured JSON Schema
Settings.llm = OpenAI(model="gpt-3.5-turbo", temperature=0.1)

# Configure global embedding to match the report processor
Settings.embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-en-v1.5")

def get_rag_query_engine(user_id: str):
    """Initializes the connection and applies strict patient-level filtering."""
    
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
    
    index = VectorStoreIndex.from_vector_store(vector_store=vector_store)
    
    # FILTERING: Fetch THIS patient's personal reports OR the general medical guidelines
    filters = MetadataFilters(
        filters=[
            MetadataFilter(key="user_id", value=user_id, operator=FilterOperator.EQ),
            MetadataFilter(key="doc_type", value="guideline", operator=FilterOperator.EQ)
        ],
        condition=FilterCondition.OR
    )
    
    # Configure the query engine to output the structured Pydantic model
    query_engine = index.as_query_engine(
        filters=filters,
        output_cls=ChatbotResponse,
        response_mode="compact"
    )
    return query_engine

def analyze_symptoms(user_input: str, user_id: str) -> ChatbotResponse:
    """Passes the user symptoms and ID to the RAG pipeline."""
    query_engine = get_rag_query_engine(user_id)
    
    prompt = (
        f"You are the Prescripto AI Triage Assistant. "
        f"Analyze the following patient symptoms: '{user_input}'. "
        f"1. Search the retrieved context for the patient's past medical reports. Note any historical conditions (like high blood pressure, diabetes, etc.) that might worsen their current symptoms. "
        f"2. Use standard medical guidelines to provide triage advice, probable causes, and an urgency level. "
        f"3. Recommend specific lab tests. "
        f"4. State the exact hospital department (e.g., Neurology, Orthopedics) best suited to treat this."
    )
    
    response = query_engine.query(prompt)
    return response