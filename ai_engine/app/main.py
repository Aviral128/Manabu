from fastapi import FastAPI
from app.api.routes import router as api_router
from app.core.logging import configure_logging

configure_logging()
app = FastAPI(title="MANABU AI Engine", version="1.0.0")
app.include_router(api_router, prefix="/v1/ai")

@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "ai-engine"}
