from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Announcement, User
from app.core.security import get_current_user, require_professor
from datetime import datetime

router = APIRouter(prefix="/avisos", tags=["Avisos"])


@router.get("/")
def listar_avisos(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """Lista avisos visíveis"""
    avisos = db.query(Announcement).filter(
        Announcement.visivel == True
    ).order_by(Announcement.criado_em.desc()).all()
    
    return [
        {
            "id": a.id,
            "titulo": a.titulo,
            "mensagem": a.mensagem,
            "tipo": a.tipo,
            "professor": a.professor.nome,
            "criado_em": a.criado_em.isoformat(),
        }
        for a in avisos
    ]


@router.post("/")
def criar_aviso(
    titulo: str,
    mensagem: str,
    tipo: str = "aviso",  # "aviso", "comunicado", "importante"
    db: Session = Depends(get_db),
    current_user: User = Depends(require_professor)
):
    """Cria novo aviso - PROFESSOR"""
    if tipo not in ["aviso", "comunicado", "importante"]:
        raise HTTPException(status_code=422, detail="Tipo de aviso inválido")
    
    aviso = Announcement(
        professor_id=current_user.id,
        titulo=titulo,
        mensagem=mensagem,
        tipo=tipo
    )
    db.add(aviso)
    db.commit()
    db.refresh(aviso)
    
    return {"msg": "Aviso criado", "id": aviso.id}


@router.delete("/{aviso_id}")
def deletar_aviso(
    aviso_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_professor)
):
    """Deleta aviso - PROFESSOR"""
    aviso = db.query(Announcement).filter(Announcement.id == aviso_id).first()
    if not aviso:
        raise HTTPException(status_code=404, detail="Aviso não encontrado")
    
    if aviso.professor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Sem permissão")
    
    aviso.visivel = False
    db.commit()
    return {"msg": "Aviso removido"}
