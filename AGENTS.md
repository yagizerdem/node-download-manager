# AGENTS.md

## Skill: Commit Message Generator

Generate Conventional Commit messages for this repo.

### Commit Types

| Type       | Description                                                 |
| ---------- | ----------------------------------------------------------- |
| `feat`     | Add, change, or remove an API/UI feature                    |
| `fix`      | Fix an API/UI bug                                           |
| `refactor` | Restructure code without changing behavior                  |
| `perf`     | Improve performance                                         |
| `style`    | Formatting or code-style-only changes                       |
| `test`     | Add or fix tests                                            |
| `docs`     | Documentation-only changes                                  |
| `build`    | Build tools, dependencies, versions, or build configuration |
| `ops`      | Infrastructure, deployment, CI/CD, monitoring, or recovery  |
| `chore`    | General maintenance tasks                                   |

### Rules

- Output only the commit message.
- Format: `type: description`
- Scope must be `backend`, `web`, or `mobile`, based on the changed files.
- Use only the commit types listed above.
- Keep the description concise and specific.
- Include the task/code prefix when provided.
- Do not add explanations or additional text.

Use `git diff` and `git diff --staged` to inspect changes before generating the commit message.
