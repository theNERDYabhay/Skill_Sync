from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from recommender import SkillSyncRecommender

app = FastAPI(
    title="SkillSync AI Recommendation Service",
    version="2.4.1",
    description="High-Throughput Two-Sided Skill Complementarity & Team Recommendation Engine"
)

recommender = SkillSyncRecommender()

class MatchRequest(BaseModel):
    source_user: Dict[str, Any]
    target_users: List[Dict[str, Any]]
    weights: Optional[Dict[str, float]] = None

class WeightUpdateRequest(BaseModel):
    weights: Dict[str, float]

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SkillSync-ML-FastAPI",
        "model_version": recommender.model_version,
    }

@app.post("/recommend/candidates")
def recommend_candidates(payload: MatchRequest):
    if payload.weights:
        engine = SkillSyncRecommender(payload.weights)
    else:
        engine = recommender

    results = []
    for target in payload.target_users:
        score_breakdown = engine.score_candidate_pair(payload.source_user, target)
        results.append({
            "target_id": target.get("id"),
            "score": score_breakdown["overall_score"],
            "breakdown": score_breakdown
        })

    # Sort descending by overall match score
    results.sort(key=lambda x: x["score"], reverse=True)
    return {
        "recommendations": results,
        "model_version": engine.model_version
    }

@app.put("/weights")
def update_weights(payload: WeightUpdateRequest):
    recommender.weights.update(payload.weights)
    return {
        "updated_weights": recommender.weights,
        "message": "Weights updated across inference pipelines"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
