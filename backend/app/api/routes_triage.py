from fastapi import APIRouter, HTTPException

from app.schemas import ChatbotRequest, ChatbotResponse
from app.services.rag_engine import analyze_symptoms

router = APIRouter(prefix="/chatbot", tags=["AI Triage"])

@router.post("/triage", response_model=ChatbotResponse)
def automated_triage(
    request: ChatbotRequest,
):
    """
    Accepts user symptoms and patient_id, returning context-aware triage advice, 
    test recommendations, and the ideal routing department.
    """
    try:
        # Pass the input AND the patient_id to the filtered LlamaIndex RAG engine
        result = analyze_symptoms(
            user_input=request.symptoms_input, 
            user_id=str(request.patient_id),
        )
        
        # Extract the Pydantic object from LlamaIndex's Response object
        if isinstance(result.response, ChatbotResponse):
            return result.response
            
        # Fallback if LlamaIndex failed to parse the structured output (e.g. API error)
        return ChatbotResponse(
            triage_advice=str(result.response) if result.response else "Unable to generate a medical response at this time.",
            probable_causes=["Unknown (System Error)"],
            recommended_tests=[],
            urgency_level="MEDIUM",
            recommended_department="General Medicine"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))