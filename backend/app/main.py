from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import init_db
from app.routes import auth, users, courses, quiz, ranking, posts, alunos, admin, debug
from app.routes import conteudo, avisos
from mangum import Mangum

app = FastAPI(title="Conecta Comunidade API", version="3.0.0")

@app.on_event("startup")
def startup_event():
    init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"], # "https://seu-projeto.vercel.app",  # ← adicionar depois de fazer o deploy
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(courses.router)
app.include_router(quiz.router)
app.include_router(ranking.router)
app.include_router(posts.router)
app.include_router(alunos.router)
app.include_router(admin.router)
app.include_router(conteudo.router)
app.include_router(avisos.router)
app.include_router(debug.router)

@app.get("/")
def root():
    return {"mensagem": "API Conecta Comunidade v3 com Dashboard Admin 🚀"}
handler = Mangum(app)