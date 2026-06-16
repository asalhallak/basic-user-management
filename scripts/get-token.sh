#!/usr/bin/env bash
# Print a JWT from the local API login endpoint (for curl or manual testing).
# Override defaults with API_URL, AUTH_USER, and AUTH_PASSWORD when needed.
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: get-token.sh [--help]

Print a JWT from POST /api/v1/auth/login on the local API.
Use with curl: TOKEN=$(./scripts/get-token.sh) or make token.

Environment variables:
  API_URL        Base API URL (default: http://localhost:5000)
  AUTH_USER      Login username (default: admin)
  AUTH_PASSWORD  Login password (default: 123456789)

Requires the API to be running (make run-api).
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

API_URL="${API_URL:-http://localhost:5000}"
AUTH_USER="${AUTH_USER:-admin}"
AUTH_PASSWORD="${AUTH_PASSWORD:-123456789}"
LOGIN_ENDPOINT="${API_URL}/api/v1/auth/login"

login_body="$(printf '{"userName":"%s","password":"%s"}' "${AUTH_USER}" "${AUTH_PASSWORD}")"
login_response="$(curl -s -w $'\n%{http_code}' -X POST "${LOGIN_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d "${login_body}" || true)"
login_http_code="${login_response##*$'\n'}"
login_payload="${login_response%$'\n'*}"

if [[ "${login_http_code}" == "000" ]]; then
  echo "FAIL: Could not reach the API at ${API_URL}" >&2
  echo "Start it with: make run-api" >&2
  exit 1
fi

if [[ "${login_http_code}" != "200" ]]; then
  echo "FAIL: Login returned HTTP ${login_http_code}" >&2
  echo "Response: ${login_payload}" >&2
  exit 1
fi

token="$(echo "${login_payload}" | grep -o '"token":"[^"]*"' | cut -d'"' -f4 || true)"
if [[ -z "${token}" ]]; then
  echo "FAIL: Login succeeded but no token was found in the response" >&2
  exit 1
fi

echo "${token}"
