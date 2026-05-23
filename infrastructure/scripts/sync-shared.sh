#!/usr/bin/env bash
echo "🔄 Syncing shared code..."
rsync -av --delete ../shared/ frontend/src/shared/ 2>/dev/null || cp -r ../shared/* frontend/src/shared/ 2>/dev/null || true
rsync -av --delete ../shared/ backend/src/shared/ 2>/dev/null || cp -r ../shared/* backend/src/shared/ 2>/dev/null || true
rsync -av --delete ../shared/ mobile/src/shared/ 2>/dev/null || cp -r ../shared/* mobile/src/shared/ 2>/dev/null || true
echo "✅ Shared synced"
