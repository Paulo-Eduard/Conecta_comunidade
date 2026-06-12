from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Content, Curso, User
from app.core.security import get_current_user, require_professor

router = APIRouter(prefix="/conteudo", tags=["Conteúdo"])


class ContentCreate:
    """Schema para criar conteúdo"""
    pass


@router.get("/curso/{curso_id}")
def listar_conteudo_curso(
    curso_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lista conteúdo de um curso"""
    conteudos = db.query(Content).filter(
        Content.curso_id == curso_id,
        Content.ativo == True
    ).order_by(Content.ordem).all()
    
    return [
        {
            "id": c.id,
            "titulo": c.titulo,
            "descricao": c.descricao,
            "tipo": c.tipo,
            "url": c.url,
            "ordem": c.ordem,
        }
        for c in conteudos
    ]


@router.post("/admin")
def criar_conteudo(
    curso_id: int,
    titulo: str,
    descricao: str,
    tipo: str,  # "video", "pdf", "texto", "link"
    url: str = None,
    ordem: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_professor)
):
    """Cria novo conteúdo - PROFESSOR"""
    if tipo not in ["video", "pdf", "texto", "link"]:
        raise HTTPException(status_code=422, detail="Tipo inválido")
    
    # Verificar curso existe
    curso = db.query(Curso).filter(Curso.id == curso_id).first()
    if not curso:
        raise HTTPException(status_code=404, detail="Curso não encontrado")
    
    conteudo = Content(
        curso_id=curso_id,
        titulo=titulo,
        descricao=descricao,
        tipo=tipo,
        url=url,
        ordem=ordem,
        criador_id=current_user.id
    )
    db.add(conteudo)
    db.commit()
    db.refresh(conteudo)
    
    return {"msg": "Conteúdo criado", "id": conteudo.id}


@router.delete("/{conteudo_id}")
def deletar_conteudo(
    conteudo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_professor)
):
    """Deleta conteúdo - PROFESSOR"""
    c = db.query(Content).filter(Content.id == conteudo_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Conteúdo não encontrado")
    
    c.ativo = False
    db.commit()
    return {"msg": "Conteúdo removido"}
