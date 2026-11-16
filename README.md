# Unravel

Record a browser bug, inspect its replay and diagnostics, then turn reviewed evidence into a Playwright test.

Built with Next.js, TypeScript and PostgreSQL, with a framework-independent browser SDK. The SDK is published as [@vansham/unravel-sdk](https://www.npmjs.com/package/@vansham/unravel-sdk). Public application deployment is still pending.

## Run locally

Use Node22.18.0 and pnpm10.34.9 through Corepack.

```sh
corepack pnpm install --frozen-lockfile
# Configure apps/web/.env.local using apps/web/.env.example.
# Then initialize your own database:
corepack pnpm db:migrate
corepack pnpm db:check
corepack pnpm dev
```

Open **http://localhost:3000**. The development command also starts the separate replay player at **http://127.0.0.1:4192**. The complete workflow requires your own Clerk development application and PostgreSQL database. Landing/demo interactions can be explored without credentials; private projects and saved reports cannot.

Follow [development setup](docs/SETUP.md) for credentials, migrations, local production mode and tests.

## Try it

Open **/demo**, sign in and prepare your own recording project. Choose React or Next.js, start the reporter, reproduce an intentional failure and submit it. Inspect your private replay/timeline, review the reproduction plan and export Playwright.

For another website:

```sh
npm install @vansham/unravel-sdk@0.1.0
```

See the [SDK API and integration](packages/sdk/README.md) and [independent React/Next examples](examples/README.md).

## Project structure

- `apps/web`: application, server endpoints, migrations and in-app demos.
- `packages`: recording SDK, shared schemas and deterministic test generation.
- `examples`, `fixtures`: independent integrations and controlled test websites.
- `tests`, `scripts`: automated checks, builds and maintenance tools.
- `docs`: [architecture](docs/ARCHITECTURE.md) and [setup](docs/SETUP.md).

Replay reconstructs a supported DOM/CSS subset; it is not video or universal visual fidelity. Masked mode hides field values; explicit full mode can include sensitive entered values. Developers must review locators and confirm intended assertions; exporting does not execute or certify a test.

## License

Unravel code is [MIT licensed](LICENSE). Bundled dependencies and assets retain their licenses: [SDK notices](packages/sdk/THIRD_PARTY_NOTICES.txt), [texture provenance](apps/web/public/landing/licenses/texture-provenance.json), font licenses in `apps/web/public/landing/fonts` and additional asset notices in `apps/web/public/landing/licenses`.
