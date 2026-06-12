from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.core.security import get_current_user

router = APIRouter(prefix="/ranking", tags=["Ranking"])


@router.get("/")
def ranking(db: Session = Depends(get_db)):
    usuarios = (
        db.query(User)
        .filter(User.role == "aluno")
        .order_by(User.pontos.desc())
        .limit(50)
        .all()
    )
    return [
        {"id": u.id, "nome": u.nome, "pontos": u.pontos}
        for u in usuarios
    ]
