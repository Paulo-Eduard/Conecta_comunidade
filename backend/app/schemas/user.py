from pydantic import BaseModel, EmailStr
from typing import Optional

# ── Auth ──────────────────────────────────────────────
class UserCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    admin_code: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    senha: str

# ── Quiz ──────────────────────────────────────────────
class QuizResposta(BaseModel):
    user_id: int
    questao_id: int
    acertou: bool

# ── Posts ─────────────────────────────────────────────
class PostCreate(BaseModel):
    usuario: str
    texto: str

# ── Cursos ────────────────────────────────────────────
class CursoCreate(BaseModel):
    titulo: str
    descricao: str
    tag: str = "Geral"
    modulos: int = 1
    cor: str = "#2563eb"

class CursoUpdate(BaseModel):
    titulo: Optional[str] = None
    descricao: Optional[str] = None
    tag: Optional[str] = None
    modulos: Optional[int] = None
    ativo: Optional[bool] = None
