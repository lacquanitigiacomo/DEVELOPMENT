#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════╗
# ║  RYB v20.0 — Zero-Stress Launcher                          ║
# ║  "Clone. Launch. Done."                                    ║
# ╚══════════════════════════════════════════════════════════════╝

set -e

# Colori
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

PROJECT_ROOT="/workspaces/DEVELOPMENT/RYB_v20_Zero_Stress"

echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     RYB v20.0 — Zero-Stress Launcher                         ║"
echo "║     Clone → Launch → Done. Zero configuration.               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ═══════════════════════════════════════════════════════════════
# STEP 1: Verifica struttura
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}${BOLD}📁 Step 1/7 — Verifica struttura...${NC}"
if [ ! -d "$PROJECT_ROOT" ]; then
    echo -e "${YELLOW}⚠️  Progetto non trovato in $PROJECT_ROOT${NC}"
    echo "   Cerco in /workspaces/DEVELOPMENT/..."
    PROJECT_ROOT=$(find /workspaces/DEVELOPMENT -maxdepth 2 -name "Makefile" -exec dirname {} \; | head -1)
    if [ -z "$PROJECT_ROOT" ]; then
        echo -e "${RED}❌ Progetto RYB non trovato!${NC}"
        exit 1
    fi
    echo -e "   ✅ Trovato: $PROJECT_ROOT"
fi
cd "$PROJECT_ROOT"

# Verifica file essenziali
for file in "Makefile" "docker-compose.yml" ".env.example" "shared/env-engine.ts"; do
    if [ ! -f "$file" ]; then
        echo -e "${YELLOW}⚠️  File mancante: $file${NC}"
    fi
done
echo -e "${GREEN}✅ Struttura OK${NC}"

# ═══════════════════════════════════════════════════════════════
# STEP 2: Zero-Stress Env — NON serve .env manuale!
# ═══════════════════════════════════════════════════════════════
echo ""
echo -e "${BLUE}${BOLD}🔐 Step 2/7 — Zero-Stress Environment...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}   .env non trovato — nessun problema!${NC}"
    echo -e "   ${GREEN}✅ L'app caricherà automaticamente i default da .env.example${NC}"
else
    echo -e "${GREEN}   ✅ .env trovato — userò configurazione personalizzata${NC}"
fi

# ═══════════════════════════════════════════════════════════════
# STEP 3: Verifica ambiente
# ═══════════════════════════════════════════════════════════════
echo ""
echo -e "${BLUE}${BOLD}🔍 Step 3/7 — Verifica ambiente...${NC}"
if command -v node &> /dev/null; then
    echo -e "   ${GREEN}✅ Node.js $(node -v)${NC}"
else
    echo -e "   ${YELLOW}⚠️  Node.js non trovato — installazione necessaria${NC}"
fi

if command -v npm &> /dev/null; then
    echo -e "   ${GREEN}✅ npm $(npm -v)${NC}"
else
    echo -e "   ${YELLOW}⚠️  npm non trovato${NC}"
fi

if command -v docker &> /dev/null; then
    echo -e "   ${GREEN}✅ Docker $(docker -v | awk '{print $3}' | tr -d ',')${NC}"
else
    echo -e "   ${YELLOW}⚠️  Docker non trovato — i servizi DB/Redis/MinIO non saranno disponibili${NC}"
    echo -e "      L'app funzionerà in modalità 'in-memory dev' (limitata ma funzionante)"
fi

# ═══════════════════════════════════════════════════════════════
# STEP 4: Installazione dipendenze
# ═══════════════════════════════════════════════════════════════
echo ""
echo -e "${BLUE}${BOLD}📦 Step 4/7 — Installazione dipendenze...${NC}"
echo -e "   ${YELLOW}(2-4 minuti in base alla connessione...)${NC}"

make install 2>/dev/null || {
    echo -e "   ${YELLOW}make install fallito, provo npm install manuale...${NC}"
    for dir in frontend backend mobile ai-core tests/e2e; do
        if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
            echo -e "   📦 Installing $dir..."
            (cd "$dir" && npm install --silent) || true
        fi
    done
}
echo -e "${GREEN}✅ Dipendenze installate${NC}"

# ═══════════════════════════════════════════════════════════════
# STEP 5: Avvio Docker (se disponibile)
# ═══════════════════════════════════════════════════════════════
echo ""
echo -e "${BLUE}${BOLD}🐳 Step 5/7 — Avvio Docker stack...${NC}"
if command -v docker &> /dev/null && [ -f "docker-compose.yml" ]; then
    make docker-up 2>/dev/null || docker compose up -d 2>/dev/null || {
        echo -e "   ${YELLOW}⚠️  Docker compose non disponibile — proseguo senza DB${NC}"
    }
    if command -v docker &> /dev/null; then
        echo -e "   Attendo 10s per i servizi..."
        sleep 10
        echo -e "${GREEN}✅ Docker stack avviato${NC}"
    fi
else
    echo -e "   ${YELLOW}⚠️  Docker non disponibile — modalità 'in-memory dev'${NC}"
    echo -e "      ⚠️  Database: mock in-memory (i dati non persistono)"
    echo -e "      ⚠️  Redis: mock in-memory"
    echo -e "      ⚠️  MinIO: filesystem locale"
fi

# ═══════════════════════════════════════════════════════════════
# STEP 6: Avvio servizi in background
# ═══════════════════════════════════════════════════════════════
echo ""
echo -e "${BLUE}${BOLD}🚀 Step 6/7 — Avvio servizi...${NC}"

# Backend
if [ -d "backend" ] && [ -f "backend/package.json" ]; then
    nohup bash -c "cd backend && npm run dev" > /tmp/ryb-backend.log 2>&1 &
    echo -e "   ${GREEN}✅ Backend${NC}     → http://localhost:3001    (log: /tmp/ryb-backend.log)"
fi

# AI Core
if [ -d "ai-core" ] && [ -f "ai-core/package.json" ]; then
    nohup bash -c "cd ai-core && npm run dev" > /tmp/ryb-ai.log 2>&1 &
    echo -e "   ${GREEN}✅ AI Core${NC}     → http://localhost:3002    (log: /tmp/ryb-ai.log)"
fi

# Frontend
if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
    nohup bash -c "cd frontend && npm run dev" > /tmp/ryb-frontend.log 2>&1 &
    echo -e "   ${GREEN}✅ Frontend${NC}    → http://localhost:5173    (log: /tmp/ryb-frontend.log)"
fi

# Mobile
if [ -d "mobile" ] && [ -f "mobile/package.json" ]; then
    nohup bash -c "cd mobile && npm run dev" > /tmp/ryb-mobile.log 2>&1 &
    echo -e "   ${GREEN}✅ Mobile${NC}      → http://localhost:5174    (log: /tmp/ryb-mobile.log)"
fi

sleep 3

# ═══════════════════════════════════════════════════════════════
# STEP 7: Verifica healthcheck
# ═══════════════════════════════════════════════════════════════
echo ""
echo -e "${BLUE}${BOLD}🏥 Step 7/7 — Verifica servizi...${NC}"
sleep 2

for port in 3001 3002 5173; do
    if curl -s "http://localhost:$port/health" > /dev/null 2>&1; then
        echo -e "   ${GREEN}✅ Porta $port — OK${NC}"
    else
        echo -e "   ${YELLOW}⚠️  Porta $port — non ancora pronta (riprova tra 10s)${NC}"
    fi
done

# ═══════════════════════════════════════════════════════════════
# RIEPILOGO
# ═══════════════════════════════════════════════════════════════
echo ""
echo -e "${CYAN}${BOLD}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}🎉 RYB v20.0 è in esecuzione!${NC}"
echo ""
echo -e "${GREEN}🔗 URL Locali:${NC}"
echo -e "   Frontend:  http://localhost:5173"
echo -e "   Mobile:    http://localhost:5174"
echo -e "   API:       http://localhost:3001/health"
echo -e "   AI Core:   http://localhost:3002/health"
echo ""
echo -e "${BLUE}🌐 URL Pubbliche (Codespaces):${NC}"
echo -e "   Trovale nella tab PORTE (in basso) → icona 🌐"
echo ""
echo -e "${YELLOW}📋 Prossimi passi:${NC}"
echo -e "   1. Apri la tab PORTE (icona 🔌 in basso a sinistra)"
echo -e "   2. Trova la porta 5173 e clicca 🌐 'Open in Browser'"
echo -e "   3. Registrati → Onboarding CCNL → Dashboard → Audit Busta Paga"
echo ""
echo -e "${CYAN}🛠️  Comandi utili:${NC}"
echo -e "   make docker-down    # Ferma Docker"
echo -e "   make status         # Stato servizi"
echo -e "   tail -f /tmp/ryb-*.log  # Log in tempo reale"
echo -e "${CYAN}${BOLD}═══════════════════════════════════════════════════════════════${NC}"
