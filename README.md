# Rastria

Plataforma digital de acompanhamento de saúde e desempenho físico, com uso individual (B2C) e institucional (B2B/B2G).

- **Guia completo do projeto e do domínio para desenvolvimento:** [agents/claude.md](agents/claude.md)
- **MVP em produção:** rastria.up.railway.app

## Estrutura

```
backend/    Django + DRF
frontend/   React (Vite) + Tailwind
docs/       material público (marca, pitch, diagramas)
agents/     guia do projeto para agentes/desenvolvimento
```

## Rodando localmente

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
