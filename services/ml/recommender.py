"""
SkillSync AI Recommendation Engine
Model Version: v2.4.1-hybrid-complementarity
Implements:
  candidate_score = 
      0.30 * skill_complementarity
    + 0.20 * semantic_similarity
    + 0.15 * goal_compatibility
    + 0.15 * project_relevance
    + 0.10 * experience_relevance
    + 0.10 * availability_fit
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Cross-domain synergy matrix
SYNERGY_PAIRS = {
    ("frontend", "backend"): 0.95,
    ("frontend", "ai/ml"): 0.96,
    ("frontend", "ui/ux"): 0.98,
    ("backend", "mobile"): 0.92,
    ("backend", "devops"): 0.94,
    ("backend", "ai/ml"): 0.95,
    ("product", "frontend"): 0.90,
    ("product", "ai/ml"): 0.92,
    ("security", "backend"): 0.91,
}

SKILL_TO_CATEGORY = {
    "react": "frontend",
    "next.js": "frontend",
    "vue.js": "frontend",
    "tailwind css": "frontend",
    "python": "programming",
    "fastapi": "backend",
    "go (golang)": "backend",
    "rust": "programming",
    "postgresql": "backend",
    "redis": "backend",
    "docker": "devops",
    "kubernetes": "devops",
    "pytorch": "ai/ml",
    "machine learning": "ai/ml",
    "nlp & llms": "ai/ml",
    "computer vision": "ai/ml",
    "figma": "ui/ux",
    "ui/ux design": "ui/ux",
    "kotlin": "mobile",
    "jetpack compose": "mobile",
    "product management": "product",
    "cybersecurity": "security",
    "solidity": "security",
}

class SkillSyncRecommender:
    def __init__(self, weights: Optional[Dict[str, float]] = None):
        self.weights = weights or {
            "skill_complementarity": 0.30,
            "semantic_similarity": 0.20,
            "goal_compatibility": 0.15,
            "project_relevance": 0.15,
            "experience_relevance": 0.10,
            "availability_fit": 0.10,
        }
        self.model_version = "v2.4.1-hybrid-complementarity"

    def compute_skill_complementarity(self, source_skills: List[str], target_skills: List[str]) -> Dict[str, Any]:
        cats_source = {SKILL_TO_CATEGORY.get(s.lower(), "other") for s in source_skills}
        cats_target = {SKILL_TO_CATEGORY.get(s.lower(), "other") for s in target_skills}

        synergy_score = 0.4
        reasons = []

        for cs in cats_source:
            for ct in cats_target:
                pair = (cs, ct)
                rev_pair = (ct, cs)
                if pair in SYNERGY_PAIRS:
                    synergy_score = max(synergy_score, SYNERGY_PAIRS[pair])
                    reasons.append(f"Disciplinary synergy: {cs.upper()} + {ct.upper()}")
                elif rev_pair in SYNERGY_PAIRS:
                    synergy_score = max(synergy_score, SYNERGY_PAIRS[rev_pair])
                    reasons.append(f"Disciplinary synergy: {ct.upper()} + {cs.upper()}")

        return {
            "score": min(1.0, synergy_score),
            "reasons": list(set(reasons))[:3]
        }

    def compute_semantic_similarity(self, text_a: str, text_b: str) -> float:
        if not text_a.strip() or not text_b.strip():
            return 0.3
        vectorizer = TfidfVectorizer(stop_words='english')
        try:
            tfidf = vectorizer.fit_transform([text_a, text_b])
            sim = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
            return float(np.clip(sim, 0.15, 0.98))
        except Exception:
            return 0.4

    def score_candidate_pair(self, source_user: Dict[str, Any], target_user: Dict[str, Any]) -> Dict[str, Any]:
        source_skills = [s["name"] for s in source_user.get("skills", [])]
        target_skills = [s["name"] for s in target_user.get("skills", [])]

        comp_res = self.compute_skill_complementarity(source_skills, target_skills)
        comp_score = comp_res["score"]

        text_a = f"{source_user.get('headline', '')} {source_user.get('bio', '')}"
        text_b = f"{target_user.get('headline', '')} {target_user.get('bio', '')}"
        sem_score = self.compute_semantic_similarity(text_a, text_b)

        shared_goals = set(source_user.get("goals", [])).intersection(set(target_user.get("goals", [])))
        goal_score = len(shared_goals) / max(len(source_user.get("goals", [1])), 1)

        proj_score = 0.7 if any(t in source_user.get("lookingForSkills", []) for t in target_skills) else 0.4
        exp_score = 0.85
        avail_score = 0.95 if target_user.get("availability") == "available_now" else 0.70

        overall = (
            self.weights["skill_complementarity"] * comp_score +
            self.weights["semantic_similarity"] * sem_score +
            self.weights["goal_compatibility"] * goal_score +
            self.weights["project_relevance"] * proj_score +
            self.weights["experience_relevance"] * exp_score +
            self.weights["availability_fit"] * avail_score
        )

        overall_pct = int(np.clip(overall * 100, 45, 99))

        reasons = comp_res["reasons"]
        if shared_goals:
            reasons.append(f"Shared collaboration goals: {', '.join(shared_goals)}")

        return {
            "overall_score": overall_pct,
            "skill_complementarity": int(comp_score * 100),
            "semantic_similarity": int(sem_score * 100),
            "goal_compatibility": int(goal_score * 100),
            "reasons": reasons,
            "model_version": self.model_version
        }
