#!/bin/bash
# Sync Shared — Sincronizza codice condiviso tra progetti

HUB_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
SHARED_DIR="$HUB_DIR/shared"

echo "🔄 Sincronizzazione codice condiviso..."

# Types
for project in frontend-future mobile-pwa backend-api ai-core; do
    target="$HUB_DIR/projects/ryb-$project/src/shared"
    mkdir -p "$target"

    if [ -d "$SHARED_DIR/types" ]; then
        cp -r "$SHARED_DIR/types" "$target/" 2>/dev/null || true
    fi
    if [ -d "$SHARED_DIR/utils" ]; then
        cp -r "$SHARED_DIR/utils" "$target/" 2>/dev/null || true
    fi

    echo "  ✅ ryb-$project aggiornato"
done

echo "🎉 Sincronizzazione completata"
