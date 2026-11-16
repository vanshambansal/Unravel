# Independent SDK examples

Both examples install published `@vansham/unravel-sdk@0.1.0` from npm. They have independent package manifests/lockfiles; install from each example directory using `--ignore-workspace`. No local SDK archive or prebuilt output is required.

## Configure and run

1. Run Unravel using [the setup guide](../docs/SETUP.md).
2. Create a project in your account for the example's exact origin: Next.js **http://localhost:4200**, React **http://localhost:4201**.
3. Copy that example's `.env.example` to `.env.local` and enter your public project ID/application origin. Restart after changing environment values. Never enter Clerk/database secrets in example configuration.
4. From the chosen example directory:

```sh
corepack pnpm install --ignore-workspace --frozen-lockfile
corepack pnpm dev
```

Next uses `NEXT_PUBLIC_UNRAVEL_PROJECT_ID` and `NEXT_PUBLIC_UNRAVEL_APPLICATION_ORIGIN`. React uses `UNRAVEL_PROJECT_ID` and `UNRAVEL_APPLICATION_ORIGIN`; its esbuild configuration injects only those public settings in development and production builds. With no project ID, the example UI works and no reporter is mounted.

Run `corepack pnpm build` inside either package to build it. Next's `UnravelReporter` is mounted once from `app/page.tsx`; React mounts it once from `src/main.tsx`. Both initialize through a browser effect and destroy on unmount.

## Scenarios

Use synthetic values. Try the intentional HTTP500, separate JavaScript error, task filters/toggles, tabs, native dialog and clipped-heading layout bug. Choose masking or full-content recording, reproduce, stop and submit, then inspect your private report in Unravel. A recorded failure is not an expected assertion; review the generated test before execution.

## Main application demo

`browser-demo` is a workspace package for the standalone React document served at `/demo/react`. Root installation/build commands handle it automatically. `/demo/next` uses a Next route. These convenient routes complement the independent example installs above.
