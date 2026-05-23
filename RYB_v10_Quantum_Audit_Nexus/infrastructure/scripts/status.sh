#!/usr/bin/env bash
echo "🐳 Docker Status:"
docker compose ps
echo ""
echo "🔌 Ports:"
ss -tuln 2>/dev/null | grep -E ':(3001|5173|5174|5432|6379|9000|9001|1025|8025|5050|5540)' || netstat -tuln 2>/dev/null | grep -E ':(3001|5173|5174|5432|6379|9000|9001|1025|8025|5050|5540)' || true
