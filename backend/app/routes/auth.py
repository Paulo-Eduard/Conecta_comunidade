import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.schemas.user import UserCreate, UserLogin
from app.core.security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

# Código de professor lido do ambiente — nunca hardcoded
ADMIN_CODE = os.getenv("ADMIN_CODE", "CONECTA2024")


@router.post("/register", status_code=201)
def register(data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")

    role = "professor" if data.admin_code == ADMIN_CODE else "aluno"

    try:
        novo = User(
            nome=data.nome,
            email=data.email,
            senha=hash_password(data.senha),
            role=role,
        )
        db.add(novo)
        db.commit()
        db.refresh(novo)
        return {"msg": f"Usuário criado como {role}", "role": role}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar usuário: {str(e)}")


@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    usuario = db.query(User).filter(User.email == data.email).first()
    if not usuario or not verify_password(data.senha, usuario.senha):
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos")

    token = create_access_token({"sub": usuario.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id":     usuario.id,
            "nome":   usuario.nome,
            "email":  usuario.email,
            "role":   usuario.role,
            "pontos": usuario.pontos,
        },
    }


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {
        "id":     current_user.id,
        "nome":   current_user.nome,
        "email":  current_user.email,
        "role":   current_user.role,
        "pontos": current_user.pontos,
    }
