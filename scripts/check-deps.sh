#!/usr/bin/env bash
# Verify local prerequisites listed in README.md before starting development.
set -euo pipefail

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
