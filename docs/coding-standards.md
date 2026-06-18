# Coding standards

Formatting and line-ending rules for this repository. The goal is consistent diffs across editors without debating style in every pull request.

## EditorConfig

The root [`.editorconfig`](../.editorconfig) file is the source of truth. Most editors apply it automatically when the [EditorConfig extension](https://editorconfig.org/#download) is installed (VS Code includes built-in support).

| Pattern | Setting | Applies to |
|---------|---------|------------|
| `[*]` | UTF-8, LF line endings, final newline, trim trailing whitespace | All text files |
| `[*]` | 2-space indent | TypeScript, HTML, CSS, JSON, YAML, shell scripts |
| `[*.{cs,csproj,sln}]` | 4-space indent | C# projects and solution files |
| `[*.md]` | `trim_trailing_whitespace = false` | Markdown (trailing spaces can be intentional) |
| `[Makefile]` | Tab indent | Root `Makefile` targets |

**C#:** Match existing files in `UserManagementAPI/`—four spaces, standard .NET naming (`PascalCase` for public members, `_camelCase` for private fields where used).

**Angular / TypeScript:** Match `front-end/src/app/`—two spaces, Angular style guide conventions for components and services.

**Shell scripts:** Keep the shebang on line 1 (`#!/usr/bin/env bash`) and use LF endings (enforced by `.gitattributes`).

## Git line endings

[`.gitattributes`](../.gitattributes) normalizes line endings on checkout and commit:

| Rule | Effect |
|------|--------|
| `* text=auto eol=lf` | Default to LF for text files |
| `*.sh text eol=lf` | Shell scripts always LF (required for shebangs and CI) |
| `*.bat` / `*.cmd` | CRLF preserved for Windows batch files |
| `*.png`, `*.jpg`, etc. | Marked `binary`—Git does not alter line endings |

If you see unexpected `^M` characters or whole-file diffs on Windows, ensure your Git `core.autocrlf` setting cooperates with `.gitattributes` (typically `input` or `false` on Unix, `true` on Windows with EditorConfig).

## Pull request hygiene

Before opening a PR:

1. Run `make ci` (see [ci-and-builds.md](ci-and-builds.md)).
2. Avoid unrelated formatting-only changes mixed with behavior changes—reviewers cannot tell what mattered.
3. Do not commit secrets; see [SECURITY.md](../SECURITY.md) and [environment-variables.md](environment-variables.md).

For the full contributor workflow, see [CONTRIBUTING.md](../CONTRIBUTING.md) and [manual-testing.md](manual-testing.md).

## Related docs

- [vscode-setup.md](vscode-setup.md) — recommended extensions and workspace settings
- [onboarding.md](onboarding.md) — setup and first tasks
- [code-map.md](code-map.md) — where to change API, auth, and UI code
