# backend/index.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/api/python")
def hello():
    return {"message": "Hello from FastAPI on Vercel!"}

# Importante: a Vercel procura pela variável 'app'