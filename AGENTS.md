# Development guidelines

- Start with `docs/PROJECT_STATUS.md`, `docs/PROJECT_BRIEF.md`, `docs/ARCHITECTURE.md`, and current `docs/DECISIONS.md`; inspect actual files/Git state. Read design/plan docs for the task, not entire historical logs by default.
- Active application: `apps/web`. Keep `prototypes/landing-motion` unchanged as the migration reference and `fixtures/test-site` independent. Product services/features are not implemented. Follow the current authorized milestone; do not restart deleted phases or expand landing work automatically.
- Discuss Docker, database, and external-service setup with the user before starting or provisioning those resources. Approval of an unrelated coding task is not infrastructure approval.
- Work discussion-first: explain and recommend alternatives for consequential product, architecture, privacy/security, and visual-design choices; obtain agreement before implementing them.
- Make routine technical decisions independently within agreed scope. Challenge unnecessary complexity and explain important tradeoffs.
- Prioritize correct functionality, simple modular architecture, and maintainability over feature count. Prefer TypeScript for application code.
- Use maintained libraries and add dependencies only for a concrete reason. Follow established patterns; avoid speculative features and premature optimization.
- Define acceptance criteria for meaningful features and keep work within the agreed milestone. Do not change unrelated working features without a reason.
- Never hardcode secrets, commit credentials, or include secrets in logs or documentation.
- Never fabricate functionality, completed features, or verification results. Distinguish proposals, current implementation, and historical results.
- Run relevant lint, typecheck, tests, and build checks when available; report actual outcomes and unavailable checks.
- Update status after significant work, append meaningful task/discussion summaries to `docs/PROMPT_LOG.md`, and record important decisions and rationale in `docs/DECISIONS.md`.
- Keep documentation concise with a clear owner for each fact; link instead of duplicating information. Read detailed architecture/design/plan docs when they exist and are relevant.
- Before deleting work, resetting Git, or destroying data, explain consequences and obtain explicit approval. Do not commit or push automatically.
