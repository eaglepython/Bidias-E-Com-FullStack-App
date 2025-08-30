from fastapi import FastAPI, Request
from pydantic import BaseModel
from typing import List, Dict, Any
import random

app = FastAPI()

class RecommendationRequest(BaseModel):
    userId: str
    preferences: Dict[str, Any] = {}
    limit: int = 10
    excludeInteracted: bool = True

class Recommendation(BaseModel):
    product_id: str
    score: float
    features: List[str]

@app.post("/content-recommendations")
def content_recommendations(req: RecommendationRequest):
    # Mock recommendations
    mock_products = [
        {"product_id": f"prod_{i}", "score": round(random.uniform(0.7, 1.0), 2), "features": ["featureA", "featureB"]}
        for i in range(1, req.limit + 1)
    ]
    return {"recommendations": mock_products}

@app.get("/")
def root():
    return {"status": "Content Recommendation Service running"}
