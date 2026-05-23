#!/usr/bin/env bash
set -e
echo "🚀 RYB v20 Zero-Stress Dev Start"
echo "1. Docker up..."
docker compose up -d
echo "2. Waiting for DB..."
sleep 5
echo "3. Migrating..."
cd ../backend && npx tsx src/db/migrate.ts
echo "✅ Ready! Services:"
echo "  Frontend: http://localhost:5173"
echo "  Mobile:   http://localhost:5174"
echo "  API:      http://localhost:3001"
echo "  AI Core:  http://localhost:3002"
