#!/bin/sh
set -e

echo "[EntryPoint] Checking data files..."

check_and_fix_file() {
    file="$1"
    content="$2"
    if [ ! -f "$file" ]; then
        echo "[EntryPoint] $file not found, creating..."
        mkdir -p "$(dirname "$file")"
        echo "$content" > "$file"
    fi

    if [ -d "$file" ]; then
        echo "[EntryPoint] ERROR: $file is a directory! Remove it and retry."
        exit 1
    fi
}

# Only create defaults if files don't exist
check_and_fix_file "/app/server/user.json" "[]"
check_and_fix_file "/app/server/invite_codes.json" '[{"code":"VIP2026","used":false,"createdAt":"2026-03-31T00:00:00.000Z"}]'

echo "[EntryPoint] Fixing permissions for appuser (uid 1001)..."
chown -R 1001:1001 /app/server/*.json 2>/dev/null || true

echo "[EntryPoint] Starting app..."
exec "$@"
