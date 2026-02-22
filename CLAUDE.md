# CLAUDE.md

Project-level instructions for Claude Code in this workspace.

## Stack

- **Languages**: TypeScript, JavaScript, Python
- **Frontend**: Web (HTML/CSS/JS/TS)
- **Backend**: Node.js APIs, Python services

## Code Style

### TypeScript / JavaScript
- Use ESLint + Prettier with default/project config
- Prefer `const` over `let`; avoid `var`
- Use `async/await` over raw Promise chains
- Prefer named exports over default exports
- File names: `kebab-case.ts` for modules, `PascalCase.tsx` for React components

### Python
- Follow PEP 8
- Use type hints on all function signatures
- Prefer f-strings for string formatting
- Use `snake_case` for variables/functions, `PascalCase` for classes

## Git Conventions

Use **Conventional Commits**:

```
feat: add user authentication flow
fix: resolve null pointer in payment handler
chore: update dependencies
docs: update API reference
refactor: simplify database connection pooling
test: add coverage for edge cases in parser
```

- Keep commits atomic and focused
- Write commit messages in the imperative mood after the prefix
- Do not commit directly to `main`; use feature branches

## Testing

- Write tests alongside new features, not as an afterthought
- Tests live in `__tests__/` (JS/TS) or `tests/` (Python)
- Prefer unit tests for pure logic; integration tests for API boundaries
- Mock external services in tests; do not rely on live APIs

**JS/TS**: Jest or Vitest
**Python**: pytest

## Common Commands

Update these per project as needed:

```bash
# JS / TS
npm run dev          # start dev server
npm run build        # production build
npm run test         # run tests
npm run lint         # lint check
npm run format       # auto-format with Prettier

# Python
python -m pytest     # run tests
ruff check .         # lint
ruff format .        # format
```

## General Preferences

- Keep solutions simple; avoid over-engineering
- Don't add comments unless the logic is non-obvious
- Don't add error handling for scenarios that can't realistically occur
- Prefer editing existing files over creating new ones
- Always read a file before modifying it
- Ask before making large structural or architectural changes
