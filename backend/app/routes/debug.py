from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User

router = APIRouter(prefix="/debug", tags=["Debug"])


@router.get("/users")
def debug_users(db: Session = Depends(get_db)):
    """Retorna todos os usuários para debug"""
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "nome": u.nome,
            "email": u.email,
            "role": u.role,  # VERIFICAR AQUI
            "pontos": u.pontos,
        }
        for u in users
    ]


@router.get("/check-professor")
def check_professor(db: Session = Depends(get_db)):
    """Verifica professores cadastrados"""
    profs = db.query(User).filter(User.role == "professor").all()
    return {
        "total_professores": len(profs),
        "professores": [
            {"id": p.id, "nome": p.nome, "email": p.email, "role": p.role}
            for p in profs
        ]
    }
