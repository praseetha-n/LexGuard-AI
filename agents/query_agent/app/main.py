from fastapi import FastAPI

from agents.query_agent.app.routes import router


app = FastAPI(
    title="LexGuard AI - Query Intelligence Agent",
    version="1.0.0"
)


app.include_router(router)


@app.get("/health")
def health_check():
    return {
        "agent": "query_agent",
        "status": "healthy"
    }