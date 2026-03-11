from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Backend running successfully"}

@app.get("/health")
def health():
    return {"status": "OK"}