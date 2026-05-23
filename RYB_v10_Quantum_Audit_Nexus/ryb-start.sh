#!/usr/bin/env bash
# RYB One-Click Start per Codespaces
set -e

echo "🚀 RYB Avvio Rapido su Codespaces"
echo "=================================="

# 1. Entra nella cartella progetto
cd /workspaces/DEVELOPMENT/RYB_v10_Quantum_Audit_Nexus

echo ""
echo "📁 Step 1/6 — Verifica struttura..."
if [ ! -f "Makefile" ] || [ ! -f "docker-compose.yml" ]; then
    echo "❌ Makefile o docker-compose.yml mancanti!"
    echo "💡 Assicurati di aver estratto lo ZIP correttamente."
    exit 1
fi
echo "✅ Struttura OK"

# 2. Env
echo ""
echo "🔐 Step 2/6 — Setup .env..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ .env creato da .env.example"
else
    echo "✅ .env già presente"
fi

# 3. Check
echo ""
echo "🔍 Step 3/6 — Verifica ambiente..."
bash scripts/codespace-check.sh || true

# 4. Install
echo ""
echo "📦 Step 4/6 — Installazione dipendenze..."
echo "   (questo può richiedere 2-3 minuti...)"
make install

# 5. Docker
echo ""
echo "🐳 Step 5/6 — Avvio Docker stack..."
make docker-up
echo "   Attendo 10s per i servizi..."
sleep 10

# 6. Avvio servizi in background
echo ""
echo "🚀 Step 6/6 — Avvio servizi..."

# Backend in background
nohup bash -c "cd backend && npm run dev" > /tmp/ryb-backend.log 2>&1 &
echo "   ✅ Backend → http://localhost:3001 (log: /tmp/ryb-backend.log)"

# AI Core in background  
nohup bash -c "cd ai-core && npm run dev" > /tmp/ryb-ai.log 2>&1 &
echo "   ✅ AI Core → http://localhost:3002 (log: /tmp/ryb-ai.log)"

# Frontend in background
nohup bash -c "cd frontend && npm run dev" > /tmp/ryb-frontend.log 2>&1 &
echo "   ✅ Frontend → http://localhost:5173 (log: /tmp/ryb-frontend.log)"

# Mobile in background
nohup bash -c "cd mobile && npm run dev" > /tmp/ryb-mobile.log 2>&1 &
echo "   ✅ Mobile → http://localhost:5174 (log: /tmp/ryb-mobile.log)"

sleep 3

echo ""
echo "=================================="
echo "🎉 RYB è in esecuzione!"
echo ""
echo "🔗 URL locali:"
echo "   Frontend:  http://localhost:5173"
echo "   Mobile:    http://localhost:5174"
echo "   API:       http://localhost:3001/health"
echo "   AI Core:   http://localhost:3002/health"
echo ""
echo "🌐 URL pubbliche Codespaces:"
echo "   (trovale nella tab PORTE in basso)"
echo ""
echo "📋 Prossimi passi:"
echo "   1. Apri la tab PORTE (in basso a sinistra)"
echo "   2. Clicca l'icona 🌐 accanto alla porta 5173"
echo "   3. Registrati → Completa Onboarding → Dashboard"
echo ""
echo "🛑 Per fermare tutto: make docker-down"
echo "📝 Per vedere i log: tail -f /tmp/ryb-*.log"
echo "=================================="
