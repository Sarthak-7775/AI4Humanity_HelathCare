from fastapi import APIRouter, HTTPException

from app.schemas import ChatbotRequest, ChatbotResponse
from app.services.rag_engine import analyze_symptoms

router = APIRouter(prefix="/chatbot", tags=["AI Triage"])

@router.post("/triage", response_model=ChatbotResponse)
def automated_triage(request: ChatbotRequest):
    """
    Accepts user symptoms and patient_id, returning context-aware triage advice, 
    test recommendations, and the ideal routing department.
    """
    try:
        # Pass the input AND the patient_id to the filtered LlamaIndex RAG engine
        result = analyze_symptoms(
            user_input=request.symptoms_input, 
            user_id=str(request.patient_id)
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))