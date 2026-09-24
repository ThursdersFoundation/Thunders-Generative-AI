from fastapi import FastAPI
from app.api.routes import router as ai_router

app = FastAPI(
    title="Thunders Generative API Backend",
    version="1.0.0",
    description="Production API interfacing Python AI-Core pipelines with frontend interfaces."
)

# Register routes
app.include_router(ai_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
