from fastapi import FastAPI

from agents.retrieval_agent.app.routes import router


app = FastAPI(
    title="LexGuard AI - Retrieval Agent",
    version="1.0.0"
)


app.include_router(router)


@app.get("/health")
def health_check():
    return {
        "agent": "retrieval_agent",
        "status": "healthy"
    }