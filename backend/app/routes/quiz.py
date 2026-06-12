from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User, Questao, QuizRespostaDB, Curso
from app.schemas.user import QuizResposta
from app.core.security import get_current_user, require_professor

router = APIRouter(prefix="/quiz", tags=["Quiz"])

PONTOS_POR_ACERTO = 10

# ─── Seed de questões demo ────────────────────────────────────────────────────
QUESTOES_SEED = [
    # Curso 1 — Internet Básica
    {"curso_id": 1, "enunciado": "O que significa a sigla 'URL'?",
     "opcao_a": "Unified Resource Locator", "opcao_b": "Universal Remote Link",
     "opcao_c": "Uniform Resource Locator", "opcao_d": "United Resource Location",
     "correta": "c"},
    {"curso_id": 1, "enunciado": "Qual protocolo garante que um site é seguro (cadeado verde)?",
     "opcao_a": "HTTP",  "opcao_b": "FTP", "opcao_c": "HTTPS", "opcao_d": "SMTP",
     "correta": "c"},
    # Curso 3 — Segurança Digital
    {"curso_id": 3, "enunciado": "O que é phishing?",
     "opcao_a": "Um esporte aquático", "opcao_b": "Golpe online que imita sites confiáveis",
     "opcao_c": "Tipo de antivírus", "opcao_d": "Rede wi-fi pública",
     "correta": "b"},
    {"curso_id": 3, "enunciado": "Uma senha segura deve ter no mínimo:",
     "opcao_a": "4 caracteres", "opcao_b": "6 caracteres numéricos",
     "opcao_c": "8 caracteres misturando letras, números e símbolos", "opcao_d": "Seu nome + data de nascimento",
     "correta": "c"},
    # Curso 4 — Cidadania Digital
    {"curso_id": 4, "enunciado": "Fake news são:",
     "opcao_a": "Notícias internacionais", "opcao_b": "Notícias em inglês",
     "opcao_c": "Notícias falsas criadas para enganar", "opcao_d": "Notícias sobre tecnologia",
     "correta": "c"},
]


def seed_questoes(db: Session):
    if db.query(Questao).count() == 0:
        for q in QUESTOES_SEED:
            db.add(Questao(**q))
        db.commit()


# ─── Rotas ────────────────────────────────────────────────────────────────────

@router.get("/cursos/{curso_id}")
def listar_questoes(curso_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    seed_questoes(db)
    questoes = db.query(Questao).filter(Questao.curso_id == curso_id).all()
    return [
        {"id": q.id, "enunciado": q.enunciado,
         "opcao_a": q.opcao_a, "opcao_b": q.opcao_b,
         "opcao_c": q.opcao_c, "opcao_d": q.opcao_d}
        for q in questoes
    ]


@router.post("/responder")
def responder_quiz(data: QuizResposta, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    questao = db.query(Questao).filter(Questao.id == data.questao_id).first()
    if not questao:
        raise HTTPException(status_code=404, detail="Questão não encontrada")

    # Verifica se já respondeu
    ja_respondeu = db.query(QuizRespostaDB).filter(
        QuizRespostaDB.user_id == current_user.id,
        QuizRespostaDB.questao_id == data.questao_id
    ).first()

    pontos_ganhos = 0
    if not ja_respondeu:
        pontos_ganhos = PONTOS_POR_ACERTO if data.acertou else 0
        current_user.pontos += pontos_ganhos
        registro = QuizRespostaDB(
            user_id=current_user.id,
            questao_id=data.questao_id,
            acertou=data.acertou,
        )
        db.add(registro)
        db.commit()
        db.refresh(current_user)

    return {
        "mensagem": "Resposta registrada" if not ja_respondeu else "Já respondida anteriormente",
        "correta": questao.correta,
        "acertou": data.acertou,
        "pontos_ganhos": pontos_ganhos,
        "total_pontos": current_user.pontos,
        "ja_respondida": bool(ja_respondeu),
    }


@router.get("/meus-resultados")
def meus_resultados(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    respostas = db.query(QuizRespostaDB).filter(QuizRespostaDB.user_id == current_user.id).all()
    total = len(respostas)
    acertos = sum(1 for r in respostas if r.acertou)
    return {
        "total_respondidas": total,
        "acertos": acertos,
        "erros": total - acertos,
        "percentual": round(acertos / total * 100, 1) if total else 0,
    }
