#!/usr/bin/env bash
# Verify local prerequisites listed in README.md before starting development.
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: check-deps.sh [--help]

Verify that Docker, .NET SDK, Node.js, npm, and curl are available on PATH.
Warns when Node.js is not major version 16 (see .nvmrc and CI).
Also reports whether the optional dotnet-ef global tool is installed.

Exit code 0 when all required tools are present; 1 otherwise.

See README.md#prerequisites and docs/README.md for setup guidance.
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

fail=0

require() {
  local label="$1"
  local cmd="$2"
  local version_cmd="${3:-}"

  if command -v "${cmd}" >/dev/null 2>&1; then
    if [[ -n "${version_cmd}" ]]; then
      echo "OK: ${label} ($(${version_cmd} 2>/dev/null | head -n1))"
    else
      echo "OK: ${label}"
    fi
  else
    echo "FAIL: ${label} not found (expected '${cmd}' on PATH)"
    fail=1
  fi
}

echo "==> Required tools"
require "Docker" docker "docker --version"
require ".NET SDK" dotnet "dotnet --version"
require "Node.js" node "node --version"
require "npm" npm "npm --version"
require "curl" curl "curl --version"

if command -v node >/dev/null 2>&1; then
  node_major="$(node -e "console.log(process.versions.node.split('.')[0])" 2>/dev/null || true)"
  if [[ -n "${node_major}" && "${node_major}" != "16" ]]; then
    echo ""
    echo "WARN: Node.js major version is ${node_major} (recommended: 16 per .nvmrc and GitHub Actions CI)"
    echo "      Angular 11 front-end builds may fail on Node 17+ without NODE_OPTIONS=--openssl-legacy-provider"
    echo "      See README.md#troubleshooting or run: nvm use"
  fi
fi

echo ""
echo "==> Optional tools"
if dotnet tool list -g 2>/dev/null | grep -q 'dotnet-ef'; then
  echo "OK: dotnet-ef global tool"
else
  echo "WARN: dotnet-ef not installed (run: make install-ef)"
fi

echo ""
if [[ "${fail}" -eq 1 ]]; then
  echo "Some required tools are missing. See README.md#prerequisites."
  exit 1
fi

echo "All required tools are available."
