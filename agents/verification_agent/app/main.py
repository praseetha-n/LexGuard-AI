from fastapi import FastAPI
from agents.verification_agent.app.routes import router

app = FastAPI(
    title="LexGuard AI - Verification Agent",
    version="1.0.0"
)

app.include_router(router)


@app.get("/health")
def health_check():
    return {
        "agent": "verification_agent",
        "status": "healthy"
    }