import random
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class CropInput(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

# Placeholder for actual ML model loading
# In a real scenario: model = joblib.load("models/crop_rf.pkl")
# Here we use a rule-based/mock approach for MVP until trained weights are added

CROPS = ["rice", "maize", "chickpea", "kidneybeans", "pigeonpeas",
         "mothbeans", "mungbean", "blackgram", "lentil", "pomegranate",
         "banana", "mango", "grapes", "watermelon", "muskmelon", "apple",
         "orange", "papaya", "coconut", "cotton", "jute", "coffee"]

@router.post("/recommend")
def recommend_crop(data: CropInput):
    # Mock recommendation logic:
    # High rainfall -> Rice
    # Low rainfall, high temp -> Cotton
    if data.rainfall > 200:
        recommended = "rice"
    elif data.temperature > 30 and data.rainfall < 100:
        recommended = "cotton"
    else:
        recommended = random.choice(CROPS)

    return {
        "recommended_crop": recommended,
        "input_features": data.dict(),
        "confidence": round(random.uniform(0.75, 0.95), 2)
    }
