#!/bin/sh
set -e

echo "[EntryPoint] Ensuring data directory exists..."
mkdir -p /app/data

echo "[EntryPoint] Checking and fixing data files..."

check_and_fix_file() {
    file="$1"
    content="$2"
    if [ ! -f "$file" ]; then
        echo "[EntryPoint] $file not found, creating..."
        echo "$content" > "$file"
    fi
    if [ -d "$file" ]; then
        echo "[EntryPoint] ERROR: $file is a directory! Remove it and retry."
        exit 1
    fi
}

check_and_fix_file "/app/data/user.json" "[]"
check_and_fix_file "/app/data/invite_codes.json" '[{"code":"VIP2026","used":false,"createdAt":"2026-03-31T00:00:00.000Z"}]'
check_and_fix_file "/app/data/data.json" '{"namespaces":[{"id":"default","name":"默认空间","createdAt":"2026-03-31T00:00:00.000Z"}],"projects":[]}'

echo "[EntryPoint] Fixing ownership to appuser (1001:1001)..."
chown -R 1001:1001 /app/data

echo "[EntryPoint] Switching to appuser and starting app..."
exec gosu appuser "$@"
