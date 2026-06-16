# Security Policy

This repository is a **sample application for learning and local development**. It is not hardened for production use.

## Supported versions

Only the latest commit on the `main` branch is maintained. There are no long-term release branches or security backports.

## Reporting a vulnerability

If you discover a security issue in this repository (for example, a dependency with a known CVE or an unintended exposure in the sample code), please report it responsibly:

1. **Do not** open a public GitHub issue for sensitive findings.
2. Open a [private security advisory](https://github.com/asalhallak/basic-user-management/security/advisories/new) on GitHub, or contact the repository owner through GitHub.

We will acknowledge reports and work toward a fix or documentation update as appropriate for a sample project.

## Known limitations (by design)

The following behaviors are intentional for local demos but **must be changed before any real deployment**:

| Area | Current behavior | Risk |
|------|------------------|------|
| Authentication | Hardcoded `admin` / `123456789` in `AuthService` | Anyone with repo access knows the login |
| JWT secret | Development value in `appsettings.json` | Tokens can be forged if the secret leaks |
| Database password | Default SA password in `docker-compose.yml` and connection string | Trivial credential guessing on exposed hosts |
| HTTPS | JWT bearer allows HTTP (`RequireHttpsMetadata = false`) | Tokens can be intercepted on untrusted networks |
| CORS | Permissive origins for local Angular dev | Cross-origin abuse if exposed publicly |
| User registration | `POST /users` requires a JWT; not a public sign-up flow | Misconfiguration if exposed without understanding auth model |

## Safe local use

- Run the stack on `localhost` only unless you understand the exposure.
- Do not commit real credentials, API keys, or production connection strings.
- Replace `JwtSecret`, database passwords, and authentication logic before deploying anywhere reachable from the internet.
- Use `make check-deps` and the [README troubleshooting guide](README.md#troubleshooting) for setup issues—not security hardening.

## Dependency updates

Front-end (`npm`) and back-end (`dotnet`) dependencies are updated through normal pull requests. Run `make ci` after upgrading packages to confirm builds still pass.
