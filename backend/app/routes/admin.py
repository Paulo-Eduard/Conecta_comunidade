from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User, Curso, Questao, Post, QuizRespostaDB, StudentEnrollment, Announcement
from app.core.security import require_professor
from datetime import datetime, timedelta

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), _=Depends(require_professor)):
    """Dashboard do professor com todas as estatísticas"""
    
    total_alunos = db.query(User).filter(User.role == "aluno").count()
    total_profs = db.query(User).filter(User.role == "professor").count()
    total_cursos = db.query(Curso).filter(Curso.ativo == True).count()
    total_questoes = db.query(Questao).count()
    total_posts = db.query(Post).count()
    
    # Atividade
    hoje = datetime.utcnow().date()
    online_agora = db.query(User).filter(User.online == True).count()
    ativos_hoje = db.query(User).filter(
        User.last_activity >= datetime.utcnow() - timedelta(hours=24)
    ).count()
    
    # Quiz stats
    quiz_total = db.query(QuizRespostaDB).count()
    quiz_acertos = db.query(QuizRespostaDB).filter(QuizRespostaDB.acertou == True).count()
    taxa_acerto = (quiz_acertos / quiz_total * 100) if quiz_total > 0 else 0
    
    # Cursos populares
    cursos_pop = db.query(Curso.titulo, StudentEnrollment).join(
        StudentEnrollment, Curso.id == StudentEnrollment.curso_id
    ).group_by(Curso.id).limit(5).all()
    
    return {
        "estatisticas": {
            "total_alunos": total_alunos,
            "total_professores": total_profs,
            "total_cursos": total_cursos,
            "total_questoes": total_questoes,
            "total_posts": total_posts,
        },
        "atividade": {
            "online_agora": online_agora,
            "ativos_hoje": ativos_hoje,
            "inativos": total_alunos - ativos_hoje,
        },
        "quiz": {
            "total_respondidas": quiz_total,
            "acertos": quiz_acertos,
            "taxa_acerto": round(taxa_acerto, 1),
        },
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/alunos/detalhado")
def listar_alunos_detalhado(db: Session = Depends(get_db), _=Depends(require_professor)):
    """Lista alunos com informações detalhadas"""
    alunos = db.query(User).filter(User.role == "aluno").all()
    
    resultado = []
    for aluno in alunos:
        # Estatísticas do aluno
        quiz_respondidas = db.query(QuizRespostaDB).filter(
            QuizRespostaDB.user_id == aluno.id
        ).count()
        quiz_acertos = db.query(QuizRespostaDB).filter(
            QuizRespostaDB.user_id == aluno.id,
            QuizRespostaDB.acertou == True
        ).count()
        cursos_inscritos = db.query(StudentEnrollment).filter(
            StudentEnrollment.student_id == aluno.id
        ).count()
        
        resultado.append({
            "id": aluno.id,
            "nome": aluno.nome,
            "email": aluno.email,
            "pontos": aluno.pontos,
            "status": "bloqueado" if aluno.blocked else ("online" if aluno.online else "offline"),
            "last_activity": aluno.last_activity.isoformat() if aluno.last_activity else None,
            "quiz_respondidas": quiz_respondidas,
            "quiz_acertos": quiz_acertos,
            "cursos_inscritos": cursos_inscritos,
        })
    
    return resultado


@router.patch("/alunos/{aluno_id}/bloquear")
def bloquear_aluno(aluno_id: int, db: Session = Depends(get_db), _=Depends(require_professor)):
    """Bloqueia um aluno"""
    aluno = db.query(User).filter(User.id == aluno_id, User.role == "aluno").first()
    if not aluno:
        raise Exception("Aluno não encontrado")
    aluno.blocked = True
    db.commit()
    return {"msg": "Aluno bloqueado"}


@router.patch("/alunos/{aluno_id}/desbloquear")
def desbloquear_aluno(aluno_id: int, db: Session = Depends(get_db), _=Depends(require_professor)):
    """Desbloqueia um aluno"""
    aluno = db.query(User).filter(User.id == aluno_id, User.role == "aluno").first()
    if not aluno:
        raise Exception("Aluno não encontrado")
    aluno.blocked = False
    db.commit()
    return {"msg": "Aluno desbloqueado"}
