#!/bin/bash
# RYB Status — Stato di tutti i servizi

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BLUE}         RYB SERVICES STATUS${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo ""

# Funzione per verificare se un servizio è attivo
check_service() {
    local name=$1
    local url=$2
    local port=$3

    if curl -s "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}●${NC} $name ${GREEN}RUNNING${NC} ($url)"
    else
        # Verifica se il processo è in esecuzione
        if lsof -i :"$port" > /dev/null 2>&1; then
            echo -e "${YELLOW}◐${NC} $name ${YELLOW}STARTING${NC} (porta $port occupata)"
        else
            echo -e "${RED}○${NC} $name ${RED}STOPPED${NC}"
        fi
    fi
}

echo -e "${BLUE}🌐 Servizi Web:${NC}"
check_service "Frontend Future" "http://localhost:5173" "5173"
check_service "Mobile PWA" "http://localhost:5174" "5174"
check_service "Backend API" "http://localhost:3001/api/health" "3001"

echo ""
echo -e "${BLUE}🐳 Container Docker:${NC}"
if command -v docker &> /dev/null; then
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "ryb-" || echo -e "${YELLOW}Nessun container RYB attivo${NC}"
else
    echo -e "${RED}Docker non installato${NC}"
fi

echo ""
echo -e "${BLUE}📊 Risorse:${NC}"
if command -v docker &> /dev/null; then
    echo -e "Docker: $(docker --version)"
fi
echo -e "Node: $(node -v)"
echo -e "NPM: $(npm -v)"

echo ""
echo -e "${BLUE}════════════════════════════════════════════${NC}"
