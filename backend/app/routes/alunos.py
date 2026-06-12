from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.core.security import require_professor

router = APIRouter(prefix="/alunos", tags=["Alunos"])


@router.get("/stats", dependencies=[Depends(require_professor)])
def stats_alunos(db: Session = Depends(get_db)):
    total     = db.query(User).filter(User.role == "aluno").count()
    profs     = db.query(User).filter(User.role == "professor").count()
    return {"total_alunos": total, "total_professores": profs}


@router.get("/", dependencies=[Depends(require_professor)])
def listar_alunos(db: Session = Depends(get_db)):
    alunos = db.query(User).filter(User.role == "aluno").all()
    return [
        {"id": a.id, "nome": a.nome, "email": a.email, "pontos": a.pontos, "status": "ativo"}
        for a in alunos
    ]


@router.delete("/{aluno_id}", dependencies=[Depends(require_professor)])
def deletar_aluno(aluno_id: int, db: Session = Depends(get_db)):
    aluno = db.query(User).filter(User.id == aluno_id, User.role == "aluno").first()
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    db.delete(aluno)
    db.commit()
    return {"msg": "Aluno removido"}
