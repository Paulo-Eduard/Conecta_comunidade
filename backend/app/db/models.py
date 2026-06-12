from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    nome            = Column(String, nullable=False)
    email           = Column(String, unique=True, index=True, nullable=False)
    senha           = Column(String, nullable=False)
    role            = Column(String, default="aluno")  # "aluno" ou "professor"
    pontos          = Column(Integer, default=0)
    
    # ETAPA 5 — Sistema de Atividade
    last_login      = Column(DateTime, nullable=True)
    last_activity   = Column(DateTime, default=datetime.utcnow)
    online          = Column(Boolean, default=False)
    blocked         = Column(Boolean, default=False)
    created_at      = Column(DateTime, default=datetime.utcnow)

    posts           = relationship("Post", back_populates="autor", cascade="all, delete-orphan")
    respostas       = relationship("QuizRespostaDB", back_populates="usuario", cascade="all, delete-orphan")
    enrollments     = relationship("StudentEnrollment", back_populates="student", cascade="all, delete-orphan")
    conteudos       = relationship("Content", back_populates="criador", cascade="all, delete-orphan")
    avisos          = relationship("Announcement", back_populates="professor", cascade="all, delete-orphan")


class Curso(Base):
    __tablename__ = "cursos"

    id        = Column(Integer, primary_key=True, index=True)
    titulo    = Column(String, nullable=False)
    descricao = Column(Text)
    tag       = Column(String, default="Geral")
    modulos   = Column(Integer, default=1)
    cor       = Column(String, default="#2563eb")
    ativo     = Column(Boolean, default=True)

    questoes = relationship("Questao", back_populates="curso", cascade="all, delete-orphan")


class Questao(Base):
    __tablename__ = "questoes"

    id           = Column(Integer, primary_key=True, index=True)
    curso_id     = Column(Integer, ForeignKey("cursos.id"))
    enunciado    = Column(Text, nullable=False)
    opcao_a      = Column(String, nullable=False)
    opcao_b      = Column(String, nullable=False)
    opcao_c      = Column(String, nullable=False)
    opcao_d      = Column(String, nullable=False)
    correta      = Column(String, nullable=False)   # "a" | "b" | "c" | "d"

    curso        = relationship("Curso", back_populates="questoes")
    respostas    = relationship("QuizRespostaDB", back_populates="questao", cascade="all, delete-orphan")


class QuizRespostaDB(Base):
    __tablename__ = "quiz_respostas"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id"))
    questao_id   = Column(Integer, ForeignKey("questoes.id"))
    acertou      = Column(Boolean)
    criado_em    = Column(DateTime, default=datetime.utcnow)

    usuario      = relationship("User", back_populates="respostas")
    questao      = relationship("Questao", back_populates="respostas")


class Post(Base):
    __tablename__ = "posts"

    id        = Column(Integer, primary_key=True, index=True)
    user_id   = Column(Integer, ForeignKey("users.id"))
    texto     = Column(Text, nullable=False)
    fixado    = Column(Boolean, default=False)
    criado_em = Column(DateTime, default=datetime.utcnow)

    autor     = relationship("User", back_populates="posts")


# ETAPA 8 — Sistema de Conteúdos
class Content(Base):
    __tablename__ = "conteudos"

    id          = Column(Integer, primary_key=True, index=True)
    curso_id    = Column(Integer, ForeignKey("cursos.id"), nullable=False)
    titulo      = Column(String, nullable=False)
    descricao   = Column(Text)
    tipo        = Column(String, nullable=False)  # "video", "pdf", "texto", "link"
    url         = Column(String)  # para videos e links
    ordem       = Column(Integer, default=0)  # ordem de exibição
    ativo       = Column(Boolean, default=True)
    criador_id  = Column(Integer, ForeignKey("users.id"))
    criado_em   = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    curso       = relationship("Curso", foreign_keys=[curso_id])
    criador     = relationship("User", back_populates="conteudos", foreign_keys=[criador_id])


# ETAPA 9 — Avisos e Comunicados
class Announcement(Base):
    __tablename__ = "avisos"

    id          = Column(Integer, primary_key=True, index=True)
    professor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    titulo      = Column(String, nullable=False)
    mensagem    = Column(Text, nullable=False)
    tipo        = Column(String, default="aviso")  # "aviso", "comunicado", "importante"
    visivel     = Column(Boolean, default=True)
    criado_em   = Column(DateTime, default=datetime.utcnow)

    professor   = relationship("User", back_populates="avisos")


# Matrícula de aluno em curso (rastreamento de progresso)
class StudentEnrollment(Base):
    __tablename__ = "student_enrollments"

    id              = Column(Integer, primary_key=True, index=True)
    student_id      = Column(Integer, ForeignKey("users.id"), nullable=False)
    curso_id        = Column(Integer, ForeignKey("cursos.id"), nullable=False)
    progresso       = Column(Float, default=0.0)  # percentual 0-100
    concluido       = Column(Boolean, default=False)
    data_inscricao  = Column(DateTime, default=datetime.utcnow)
    data_conclusao  = Column(DateTime, nullable=True)

    student         = relationship("User", back_populates="enrollments")
    curso           = relationship("Curso")
