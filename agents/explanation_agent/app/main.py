from fastapi import FastAPI

app = FastAPI(
    title="LexGuard AI - Explanation Agent",
    version="1.0.0"
)


@app.get("/health")
def health_check():
    return {
        "agent": "explanation_agent",
        "status": "healthy"
    }