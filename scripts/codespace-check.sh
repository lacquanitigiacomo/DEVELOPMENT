#!/usr/bin/env bash
set -euo pipefail
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
ERRORS=0; WARNINGS=0; OK=0

check_item() {
    local path="$1"; local type="$2"; local required="$3"; local desc="$4"; local icon="$5"
    if [[ "$type" == "dir" ]]; then
        if [[ -d "$path" ]]; then echo -e "${GREEN}✓${NC} ${icon} ${BOLD}${path}${NC} — ${desc}"; ((OK++)); return 0; fi
    else
        if [[ -f "$path" ]]; then echo -e "${GREEN}✓${NC} ${icon} ${BOLD}${path}${NC} — ${desc}"; ((OK++)); return 0; fi
    fi
    if [[ "$required" == "required" ]]; then
        echo -e "${RED}✗${NC} ${icon} ${BOLD}${path}${NC} — ${desc} ${RED}[MANCANTE]${NC}"; ((ERRORS++))
    else
        echo -e "${YELLOW}⚠${NC} ${icon} ${BOLD}${path}${NC} — ${desc} ${YELLOW}[OPZIONALE]${NC}"; ((WARNINGS++))
    fi
}

echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     RYB Codespace Check — Zero-Stress Edition v20          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "\n${BLUE}${BOLD}📁 ROOT${NC}"
check_item "Makefile" "file" "required" "Orchestrazione" "🔧"
check_item "README.md" "file" "required" "Documentazione" "📖"
check_item "docker-compose.yml" "file" "required" "Docker stack" "🐳"
check_item ".env.example" "file" "optional" "Template env" "📋"

echo -e "\n${BLUE}${BOLD}🚀 PROJECTS${NC}"
check_item "frontend/package.json" "file" "required" "Frontend deps" "⚛️"
check_item "backend/package.json" "file" "required" "Backend deps" "🖥️"
check_item "mobile/package.json" "file" "optional" "Mobile deps" "📱"
check_item "ai-core/package.json" "file" "optional" "AI deps" "🤖"

echo -e "\n${BLUE}${BOLD}🧪 TESTS${NC}"
check_item "tests/e2e/playwright.config.ts" "file" "optional" "E2E config" "🎭"
check_item "tests/performance/load-test.js" "file" "optional" "Load test" "⚡"

echo -e "\n${BLUE}${BOLD}💻 ENVIRONMENT${NC}"
if command -v node &> /dev/null; then
    NODE_VER=$(node -v); MAJOR=$(echo "$NODE_VER" | sed 's/v\([0-9]*\).*/\1/')
    if [[ "$MAJOR" -ge 20 ]]; then echo -e "${GREEN}✓${NC} ⬢ Node ${BOLD}${NODE_VER}${NC}"; ((OK++))
    else echo -e "${YELLOW}⚠${NC} ⬢ Node ${BOLD}${NODE_VER}${NC} ${YELLOW}(>=20)${NC}"; ((WARNINGS++)); fi
else echo -e "${RED}✗${NC} ⬢ Node ${RED}[NON TROVATO]${NC}"; ((ERRORS++)); fi

if command -v npm &> /dev/null; then
    NPM_VER=$(npm -v); MAJOR=$(echo "$NPM_VER" | sed 's/\([0-9]*\).*/\1/')
    if [[ "$MAJOR" -ge 10 ]]; then echo -e "${GREEN}✓${NC} 📦 npm ${BOLD}${NPM_VER}${NC}"; ((OK++))
    else echo -e "${YELLOW}⚠${NC} 📦 npm ${BOLD}${NPM_VER}${NC} ${YELLOW}(>=10)${NC}"; ((WARNINGS++)); fi
else echo -e "${RED}✗${NC} 📦 npm ${RED}[NON TROVATO]${NC}"; ((ERRORS++)); fi

if command -v docker &> /dev/null; then echo -e "${GREEN}✓${NC} 🐳 Docker ${BOLD}$(docker -v | awk '{print $3}' | tr -d ',')${NC}"; ((OK++))
else echo -e "${YELLOW}⚠${NC} 🐳 Docker ${YELLOW}[NON TROVATO]${NC}"; ((WARNINGS++)); fi

echo -e "\n${CYAN}${BOLD}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}📊 RIEPILOGO${NC}"
echo -e "${GREEN}  ✓ OK: ${OK}${NC}"
echo -e "${YELLOW}  ⚠ Warning: ${WARNINGS}${NC}"
echo -e "${RED}  ✗ Error: ${ERRORS}${NC}"
echo -e "${CYAN}${BOLD}═══════════════════════════════════════════════════════════════${NC}"

if [[ $ERRORS -eq 0 ]]; then
    echo -e "\n${GREEN}${BOLD}🚀 Codespace pronto!${NC}"
    exit 0
else
    echo -e "\n${RED}${BOLD}❌ Codespace NON pronto.${NC}"
    exit 1
fi
