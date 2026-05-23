# RYB Architecture Overview

## Stack
- **Frontend:** React 19 + Vite 6 + Tailwind + Recharts
- **Backend:** Node 20 + Express + TypeScript + PostgreSQL + Redis
- **Mobile:** PWA Vite + React (offline capable)
- **AI:** Rule-based + HuggingFace Mistral (zero-cash)
- **Storage:** MinIO (S3 compatible, self-hosted)
- **Email:** MailHog (dev) / Nodemailer (prod)

## Zero-Cash API Strategy
| Feature | Free Solution | Fallback |
|---------|--------------|----------|
| AI Text | HuggingFace Free | Ollama local |
| OCR | Tesseract.js | Ollama vision |
| Maps | OpenStreetMap | Leaflet |
| Auth | JWT self-hosted | — |
| Storage | MinIO Docker | Local FS |
| Email | MailHog dev | Gmail SMTP |

## Data Flow
1. User → Frontend (5173)
2. Frontend → API (3001) via proxy
3. API → PostgreSQL (5432) + Redis (6379)
4. AI Core (3002) → HuggingFace / Ollama
5. Files → MinIO (9000)
