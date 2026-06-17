#!/usr/bin/env bash
# Show whether local stack services are running (informational; always exits 0).
# Override API_URL and FRONTEND_URL when services run on non-default ports.
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: status.sh [--help]

Print a quick status report for the local development stack:
  - SQL Server container (docker compose)
  - API reachability
  - Angular dev server reachability

Environment variables:
  API_URL       Base API URL (default: http://localhost:5000)
  FRONTEND_URL  Angular dev server (default: http://localhost:4200)

Also available as: make status
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

API_URL="${API_URL:-http://localhost:5000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:4200}"
USERS_ENDPOINT="${API_URL}/api/v1/users"

http_code() {
  local code
  code="$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 "$1" 2>/dev/null || true)"
  if [[ -z "${code}" || "${code}" == "000" ]]; then
    echo "000"
  else
    echo "${code}"
  fi
}

echo "==> Local stack status"
echo ""

if docker compose ps --status running 2>/dev/null | grep -q 'db'; then
  echo "  Database (docker)   running"
else
  echo "  Database (docker)   stopped  (start: make db-up)"
fi

api_code="$(http_code "${USERS_ENDPOINT}")"
if [[ "${api_code}" == "401" ]]; then
  echo "  API (${API_URL})  up (401 without token)"
elif [[ "${api_code}" == "000" ]]; then
  echo "  API (${API_URL})  not reachable  (start: make run-api)"
else
  echo "  API (${API_URL})  HTTP ${api_code}"
fi

frontend_code="$(http_code "${FRONTEND_URL}")"
if [[ "${frontend_code}" == "200" ]]; then
  echo "  Front end (${FRONTEND_URL})  up"
elif [[ "${frontend_code}" == "000" ]]; then
  echo "  Front end (${FRONTEND_URL})  not reachable  (start: make run-frontend)"
else
  echo "  Front end (${FRONTEND_URL})  HTTP ${frontend_code}"
fi

echo ""
echo "Run make verify for smoke checks that fail when something is wrong."
