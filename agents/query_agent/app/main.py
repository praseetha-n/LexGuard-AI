from fastapi import FastAPI

app = FastAPI(
    title="LexGuard AI - Query Intelligence Agent",
    version="1.0.0"
)


@app.get("/health")
def health_check():
    return {
        "agent": "query_agent",
        "status": "healthy"
    }