#!/usr/bin/env bash
# Quick smoke check for local development: database container, API JWT guard, and front end.
# Override defaults with API_URL and FRONTEND_URL when services run on non-standard ports.
set -euo pipefail

API_URL="${API_URL:-http://localhost:5000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:4200}"
USERS_ENDPOINT="${API_URL}/api/v1/users"

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

echo ""
echo "All checks passed."
