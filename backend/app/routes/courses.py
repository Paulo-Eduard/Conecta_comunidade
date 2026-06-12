from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Curso, StudentEnrollment, User
from app.schemas.user import CursoCreate, CursoUpdate
from app.core.security import get_current_user, require_professor

router = APIRouter(prefix="/cursos", tags=["Cursos"])

# ─── Seed inicial ──────────────────────────────────────────────────────────────
SEED = [
    {"titulo": "Internet Básica",      "descricao": "Aprenda os conceitos básicos da internet e navegação segura.", "tag": "Fundamentos",   "modulos": 6,  "cor": "#2563eb"},
    {"titulo": "WhatsApp",             "descricao": "Aprenda a conversar, enviar fotos, vídeos e usar grupos.",    "tag": "Comunicação",    "modulos": 4,  "cor": "#10b981"},
    {"titulo": "Segurança Digital",    "descricao": "Aprenda a identificar e evitar golpes online.",               "tag": "Segurança",      "modulos": 5,  "cor": "#ef4444"},
    {"titulo": "Cidadania Digital",    "descricao": "Privacidade, fake news e uso responsável da internet.",       "tag": "Habilidades",    "modulos": 5,  "cor": "#8b5cf6"},
    {"titulo": "Introdução ao Excel",  "descricao": "Planilhas, fórmulas básicas e gráficos para o dia a dia.",   "tag": "Produtividade",  "modulos": 6,  "cor": "#f59e0b"},
    {"titulo": "Comunicação Digital",  "descricao": "E-mails profissionais, apresentações e comunicação online.",  "tag": "Soft Skills",    "modulos": 4,  "cor": "#06b6d4"},
]


def seed_cursos(db: Session):
    if db.query(Curso).count() == 0:
        for c in SEED:
            db.add(Curso(**c))
        db.commit()


def format_curso(c: Curso, db: Session = None):
    """Formata curso com informações adicionais"""
    dados = {
        "id": c.id,
        "titulo": c.titulo,
        "descricao": c.descricao,
        "tag": c.tag,
        "modulos": c.modulos,
        "cor": c.cor,
        "ativo": c.ativo,
    }
    if db:
        # Contar alunos inscritos
        inscritos = db.query(StudentEnrollment).filter(
            StudentEnrollment.curso_id == c.id
        ).count()
        dados["alunos_inscritos"] = inscritos
    return dados


# ─── ROTAS PÚBLICAS (para alunos) ─────────────────────────────────────────

@router.get("/")
def listar_cursos(db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Lista cursos ativos para alunos"""
    seed_cursos(db)
    cursos = db.query(Curso).filter(Curso.ativo == True).all()
    return [format_curso(c, db) for c in cursos]


@router.get("/{curso_id}")
def obter_curso(curso_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Obtém detalhes de um curso"""
    c = db.query(Curso).filter(Curso.id == curso_id, Curso.ativo == True).first()
    if not c:
        raise HTTPException(status_code=404, detail="Curso não encontrado")
    return format_curso(c, db)


# ─── ROTAS ADMIN (para professores) ───────────────────────────────────────

@router.get("/admin/todos")
def listar_todos_cursos(
    db: Session = Depends(get_db),
    _: User = Depends(require_professor)
):
    """Lista TODOS os cursos (incluindo inativos) - ADMIN"""
    seed_cursos(db)
    cursos = db.query(Curso).all()
    return [format_curso(c, db) for c in cursos]


@router.post("/", status_code=201)
def criar_curso(
    data: CursoCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_professor)
):
    """Cria um novo curso - PROFESSOR"""
    c = Curso(**data.dict())
    db.add(c)
    db.commit()
    db.refresh(c)
    return {"msg": "Curso criado", "curso": format_curso(c)}


@router.patch("/{curso_id}")
def atualizar_curso(
    curso_id: int,
    data: CursoUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_professor)
):
    """Atualiza um curso - PROFESSOR"""
    c = db.query(Curso).filter(Curso.id == curso_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Curso não encontrado")
    
    for k, v in data.dict(exclude_none=True).items():
        setattr(c, k, v)
    
    db.commit()
    db.refresh(c)
    return {"msg": "Curso atualizado", "curso": format_curso(c)}


@router.delete("/{curso_id}")
def deletar_curso(
    curso_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_professor)
):
    """Deleta (desativa) um curso - PROFESSOR"""
    c = db.query(Curso).filter(Curso.id == curso_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Curso não encontrado")
    
    # Soft delete
    c.ativo = False
    db.commit()
    return {"msg": "Curso desativado"}


# ─── INSCRIÇÃO ────────────────────────────────────────────────────────────

@router.post("/{curso_id}/inscrever")
def inscrever_aluno(
    curso_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Aluno se inscreve em um curso"""
    if current_user.role == "professor":
        raise HTTPException(status_code=403, detail="Professores não podem se inscrever")
    
    # Verificar se curso existe
    curso = db.query(Curso).filter(Curso.id == curso_id, Curso.ativo == True).first()
    if not curso:
        raise HTTPException(status_code=404, detail="Curso não encontrado")
    
    # Verificar se já inscrito
    ja_inscrito = db.query(StudentEnrollment).filter(
        StudentEnrollment.student_id == current_user.id,
        StudentEnrollment.curso_id == curso_id
    ).first()
    
    if ja_inscrito:
        raise HTTPException(status_code=400, detail="Já inscrito neste curso")
    
    # Inscrever
    inscricao = StudentEnrollment(
        student_id=current_user.id,
        curso_id=curso_id
    )
    db.add(inscricao)
    db.commit()
    db.refresh(inscricao)
    
    return {"msg": "Inscrição realizada", "curso_id": curso_id}
