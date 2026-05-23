#!/bin/bash
# =========================================================
# DEV START — Avvia tutti i servizi in parallelo
# =========================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

HUB_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
LOGS_DIR="$HUB_DIR/logs"
mkdir -p "$LOGS_DIR"

echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     RYB DEVELOPMENT HUB v10.0      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"
echo ""

# Verifica prerequisiti
check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${RED}❌ $1 non trovato. Installalo prima di continuare.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ $1 trovato${NC}"
}

echo -e "${YELLOW}🔍 Verifica prerequisiti...${NC}"
check_command node
check_command npm
check_command docker
check_command git

# Verifica versione Node
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}❌ Node.js 20+ richiesto. Versione attuale: $(node -v)${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🚀 Avvio servizi in parallelo...${NC}"
echo ""

# Funzione per avviare un servizio
start_service() {
    local name=$1
    local dir=$2
    local cmd=$3
    local port=$4
    local color=$5

    echo -e "${color}▶ $name (porta $port)${NC}"

    cd "$HUB_DIR/$dir"

    # Verifica node_modules
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}  📦 Installazione dipendenze $name...${NC}"
        npm install > "$LOGS_DIR/${name}-install.log" 2>&1
    fi

    # Avvia in background
    nohup bash -c "$cmd" > "$LOGS_DIR/${name}.log" 2>&1 &
    local pid=$!
    echo $pid > "$LOGS_DIR/${name}.pid"

    # Attendi che il servizio sia pronto
    echo -e "${YELLOW}  ⏳ Attesa avvio $name...${NC}"
    for i in {1..30}; do
        if curl -s "http://localhost:$port" > /dev/null 2>&1 ||            curl -s "http://localhost:$port/api/health" > /dev/null 2>&1 ||            [ "$name" = "Frontend" ] || [ "$name" = "Mobile" ]; then
            sleep 2
            echo -e "${GREEN}  ✅ $name pronto su http://localhost:$port${NC}"
            return 0
        fi
        sleep 1
    done

    echo -e "${RED}  ⚠️  $name potrebbe non essere pronto. Controlla i log: logs/${name}.log${NC}"
    return 1
}

# Avvia servizi
start_service "Backend API" "projects/ryb-backend-api" "npm run dev" "3001" "${BLUE}"
start_service "Frontend" "projects/ryb-frontend-future" "npm run dev" "5173" "${GREEN}"
start_service "Mobile PWA" "projects/ryb-mobile-pwa" "npm run dev" "5174" "${YELLOW}"

echo ""
echo -e "${GREEN}══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  🎉 Ambiente di sviluppo pronto!${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📍 Accesso rapido:${NC}"
echo -e "  Frontend Future:  ${GREEN}http://localhost:5173${NC}"
echo -e "  Mobile PWA:       ${YELLOW}http://localhost:5174${NC}"
echo -e "  Backend API:      ${BLUE}http://localhost:3001${NC}"
echo -e "  API Health:       ${BLUE}http://localhost:3001/api/health${NC}"
echo ""
echo -e "${BLUE}📋 Comandi utili:${NC}"
echo -e "  make status        → Stato servizi"
echo -e "  make logs          → Log in tempo reale"
echo -e "  make docker-up     → Avvia PostgreSQL + Redis"
echo -e "  make test          → Esegui test suite"
echo -e "  make clean         → Pulizia completa"
echo ""
echo -e "${YELLOW}💡 Per fermare tutti i servizi: Ctrl+C o make stop${NC}"
echo ""

# Trap per cleanup
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Arresto servizi...${NC}"
    for pid_file in "$LOGS_DIR"/*.pid; do
        if [ -f "$pid_file" ]; then
            pid=$(cat "$pid_file")
            kill "$pid" 2>/dev/null || true
            rm "$pid_file"
        fi
    done
    echo -e "${GREEN}✅ Servizi arrestati${NC}"
    exit 0
}

trap cleanup INT TERM

# Mantieni aperto
echo -e "${BLUE}👀 Monitoraggio attivo. Premi Ctrl+C per fermare.${NC}"
while true; do
    sleep 1
done
