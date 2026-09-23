from fastapi import FastAPI

app = FastAPI(
    title="LexGuard AI - Retrieval Agent",
    version="1.0.0"
)


@app.get("/health")
def health_check():
    return {
        "agent": "retrieval_agent",
        "status": "healthy"
    }