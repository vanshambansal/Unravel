# React browser demo

This workspace package builds the standalone React document served at `/demo/react`. It installs the published SDK as the explicit npm alias `@unravel/published-sdk`, while the developer SDK source remains a different workspace dependency.

From the repository root, `pnpm install --frozen-lockfile` installs its dependencies and `pnpm build:demo` emits ignored `apps/web/public/demo-assets` files. Normal `pnpm dev` and the web production build run this step automatically. Source changes require `pnpm build:demo` again and a browser refresh.

The shared `apps/web/src/features/demo` scenario UI uses only React and native browser APIs. This entry imports no Next components or router. The Next demo renders the same scenarios through an ordinary route. Both call the isolated demo endpoint `/demo/api/question` and use the current app origin for their owner-authorized recording destination.

The independent `sdk-react` and `sdk-next` examples remain separate installation/user-experience checks. This package exists for the convenient interview URL, not as a replacement for external integration testing.
