# Local Unravel test website

A minimal, framework-free integration target. It is not the Unravel application, a landing-page design, or proof that the future SDK works.

From the repository root, using the existing Node installation:

```powershell
node fixtures/test-site/server.mjs
```

Open <http://127.0.0.1:4173>. Stop with Ctrl+C. The server binds only to loopback. No installation, Docker, database, keys, or external services are required.

## Test scenarios

- Select a category, enter a synthetic question, and submit. The real `POST /api/questions` deliberately returns HTTP 500. The form displays feedback, retains its values, and permits retry.
- Enter a dummy private value. The field is excluded from the submission. It will be used to test SDK masking later; the browser's password display alone is not recording privacy protection.
- Expand the diagnostic check and click **Trigger test error** to produce an intentional uncaught JavaScript error, independently of HTTP failures.

No submitted data is saved or logged. The success feedback branch is present for a future endpoint fix, but successful submission is not implemented. No SDK is installed. React/Next.js integration, navigation recording, replay, and test generation are not validated by this fixture.

## Verification

```powershell
node --check fixtures/test-site/app.js
node --check fixtures/test-site/server.mjs
node --test fixtures/test-site/server.test.mjs
```

The Node tests exercise real HTTP requests and require no dependencies. Browser verification must additionally check form feedback, retry, private-field exclusion, and the intentional JavaScript error. Use only synthetic data.
