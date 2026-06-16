#!/usr/bin/env bash
# Quick smoke check for local development: database container, API JWT guard, auth login, authenticated users, and front end.
# Override defaults with API_URL, FRONTEND_URL, AUTH_USER, AUTH_PASSWORD, and SKIP_FRONTEND when needed.
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: verify-stack.sh [--help]

Smoke-check the local stack:
  1. SQL Server container (docker compose)
  2. API returns 401 without a JWT
  3. Login returns a JWT
  4. GET /users succeeds with the JWT
  5. Angular dev server responds (unless skipped)

Environment variables:
  API_URL         Base API URL (default: http://localhost:5000)
  FRONTEND_URL    Angular dev server (default: http://localhost:4200)
  AUTH_USER       Login username (default: admin)
  AUTH_PASSWORD   Login password (default: 123456789)
  SKIP_FRONTEND   Set to 1 to skip the front-end check (API-only)

Also available as: make verify or make verify-api (SKIP_FRONTEND=1).
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

API_URL="${API_URL:-http://localhost:5000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:4200}"
AUTH_USER="${AUTH_USER:-admin}"
AUTH_PASSWORD="${AUTH_PASSWORD:-123456789}"
USERS_ENDPOINT="${API_URL}/api/v1/users"
LOGIN_ENDPOINT="${API_URL}/api/v1/auth/login"

echo "==> Database (docker compose)"
if ! docker compose ps --status running 2>/dev/null | grep -q 'db'; then
  echo "FAIL: SQL Server container 'db' is not running."
  echo "Start it with: docker compose up -d"
  exit 1
fi
echo "OK: db container is running"

echo ""
echo "==> API (${USERS_ENDPOINT})"
http_code="$(curl -s -o /dev/null -w "%{http_code}" "${USERS_ENDPOINT}" || true)"

if [[ "${http_code}" == "401" ]]; then
  echo "OK: API returned 401 without a token (JWT protection active)"
elif [[ "${http_code}" == "000" ]]; then
  echo "FAIL: Could not reach the API at ${API_URL}"
  echo "Start it with: cd UserManagementAPI/UserManagement.API && dotnet run"
  exit 1
else
  echo "WARN: Expected 401, got ${http_code}"
  exit 1
fi

echo ""
echo "==> Auth login (${LOGIN_ENDPOINT})"
login_body="$(printf '{"userName":"%s","password":"%s"}' "${AUTH_USER}" "${AUTH_PASSWORD}")"
login_response="$(curl -s -w $'\n%{http_code}' -X POST "${LOGIN_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d "${login_body}" || true)"
login_http_code="${login_response##*$'\n'}"
login_payload="${login_response%$'\n'*}"

if [[ "${login_http_code}" == "200" ]] && echo "${login_payload}" | grep -q '"token"'; then
  echo "OK: Login returned 200 with a JWT"
  token="$(echo "${login_payload}" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)"
elif [[ "${login_http_code}" == "000" ]]; then
  echo "FAIL: Could not reach the login endpoint at ${LOGIN_ENDPOINT}"
  exit 1
else
  echo "FAIL: Expected 200 with a token, got HTTP ${login_http_code}"
  echo "Response: ${login_payload}"
  exit 1
fi

echo ""
echo "==> Authenticated users (${USERS_ENDPOINT})"
auth_code="$(curl -s -o /dev/null -w "%{http_code}" "${USERS_ENDPOINT}" \
  -H "Authorization: Bearer ${token}" || true)"

if [[ "${auth_code}" == "200" ]]; then
  echo "OK: GET /users returned 200 with a valid JWT"
elif [[ "${auth_code}" == "000" ]]; then
  echo "FAIL: Could not reach the users endpoint at ${USERS_ENDPOINT}"
  exit 1
else
  echo "FAIL: Expected 200 with a valid token, got HTTP ${auth_code}"
  exit 1
fi

if [[ "${SKIP_FRONTEND:-0}" == "1" ]]; then
  echo ""
  echo "==> Front end (skipped; SKIP_FRONTEND=1)"
else
  echo ""
  echo "==> Front end (${FRONTEND_URL})"
  frontend_code="$(curl -s -o /dev/null -w "%{http_code}" "${FRONTEND_URL}" || true)"

  if [[ "${frontend_code}" == "200" ]]; then
    echo "OK: Front end returned 200"
  elif [[ "${frontend_code}" == "000" ]]; then
    echo "FAIL: Could not reach the front end at ${FRONTEND_URL}"
    echo "Start it with: cd front-end && npm start"
    exit 1
  else
    echo "WARN: Expected 200, got ${frontend_code}"
    exit 1
  fi
fi

echo ""
echo "All checks passed."
