# Next.js application notes

- Follow the root AGENTS.md and current milestone documents.
- Consult the relevant installed-version guide under node_modules/next/dist/docs before changing framework conventions.
- Keep DOM/WebGL work inside the landing controller's mounted lifecycle; the browser modules are imported from an effect.
- Scope landing styles/state to its root. Product/auth routes must not initialize graphics or fetch scene assets.
- Preserve the approved scene and unchanged Vite reference. Clerk/project persistence is implemented. The development-only SDK lab must remain unavailable in production; do not attach recording automatically to marketing/private routes. Never bypass authentication for previews or tests; live verification needs local development credentials.
