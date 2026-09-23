from fastapi import FastAPI

app = FastAPI(
    title="LexGuard AI - Verification Agent",
    version="1.0.0"
)


@app.get("/health")
def health_check():
    return {
        "agent": "verification_agent",
        "status": "healthy"
    }