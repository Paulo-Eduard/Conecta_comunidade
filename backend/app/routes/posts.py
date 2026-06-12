from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Post, User
from app.schemas.user import PostCreate
from app.core.security import get_current_user

router = APIRouter(prefix="/posts", tags=["Comunidade"])


@router.get("/")
def listar_posts(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    posts = (
        db.query(Post, User.nome)
        .join(User, Post.user_id == User.id)
        .order_by(Post.criado_em.desc())
        .offset(skip).limit(limit)
        .all()
    )
    return [
        {
            "id": p.id,
            "usuario": nome,
            "texto": p.texto,
            "criado_em": p.criado_em.isoformat() if p.criado_em else None,
        }
        for p, nome in posts
    ]


@router.post("/", status_code=201)
def criar_post(data: PostCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not data.texto.strip():
        raise HTTPException(status_code=422, detail="O texto do post não pode estar vazio")
    post = Post(user_id=current_user.id, texto=data.texto.strip())
    db.add(post)
    db.commit()
    db.refresh(post)
    return {
        "id": post.id,
        "usuario": current_user.nome,
        "texto": post.texto,
        "criado_em": post.criado_em.isoformat() if post.criado_em else None,
    }


@router.delete("/{post_id}")
def deletar_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post não encontrado")
    if post.user_id != current_user.id and current_user.role != "professor":
        raise HTTPException(status_code=403, detail="Sem permissão para deletar este post")
    db.delete(post)
    db.commit()
    return {"msg": "Post removido"}
