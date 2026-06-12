from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.core.security import get_current_user

router = APIRouter(prefix="/users", tags=["Usuários"])


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "nome": current_user.nome,
            "email": current_user.email, "pontos": current_user.pontos,
            "role": current_user.role}


@router.get("/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return {"id": u.id, "nome": u.nome, "email": u.email,
            "pontos": u.pontos, "role": u.role}
