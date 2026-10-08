from fastapi import FastAPI

from agents.explanation_agent.app.routes import router


app = FastAPI(
    title="LexGuard AI - Explanation Agent",
    version="1.0.0"
)


app.include_router(router)


@app.get("/health")
def health_check():
    return {
        "agent": "explanation_agent",
        "status": "healthy"
    }