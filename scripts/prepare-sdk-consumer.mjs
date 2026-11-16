import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const root = fileURLToPath(new URL('../', import.meta.url));
const registry = process.argv.includes('--registry');
const consumerName = registry ? 'sdk-registry-consumer' : 'sdk-release-consumer';
const target = resolve(root, '.cache', consumerName);
const sdk = JSON.parse(await readFile(resolve(root, 'packages/sdk/package.json'), 'utf8'));
const web = JSON.parse(await readFile(resolve(root, 'apps/web/package.json'), 'utf8'));
let sdkDependency = sdk.version;
if (!registry) {
  const archiveName = sdk.name.replace(/^@/, '').replace('/', '-');
  const archive = resolve(root, `.cache/sdk-distribution/${archiveName}-${sdk.version}.tgz`);
  const digest = createHash('sha256')
    .update(await readFile(archive))
    .digest('hex')
    .slice(0, 12);
  const immutable = archive.replace(/\.tgz$/, `-${digest}.tgz`);
  sdkDependency = `file:${immutable.replaceAll('\\', '/')}`;
}
await mkdir(target, { recursive: true });
await writeFile(
  resolve(target, 'package.json'),
  JSON.stringify(
    {
      name: 'unravel-sdk-release-consumer',
      private: true,
      type: 'module',
      dependencies: {
        [sdk.name]: sdkDependency,
        next: web.dependencies.next,
        react: web.dependencies.react,
        'react-dom': web.dependencies['react-dom'],
      },
      devDependencies: {
        typescript: '5.9.3',
        '@types/node': '22.18.0',
        '@types/react': web.devDependencies['@types/react'],
        '@types/react-dom': web.devDependencies['@types/react-dom'],
      },
    },
    null,
    2,
  ) + '\n',
);
// Copy only test-site sources. No workspace package aliases or integration credentials.
await cp(resolve(root, 'fixtures/standard-next/app'), resolve(target, 'app'), { recursive: true });
await writeFile(
  resolve(target, 'settings.ts'),
  `import {readFile} from 'node:fs/promises';\nexport async function settings(){return JSON.parse(await readFile(${JSON.stringify(resolve(root, '.cache/standard-next-config.json'))},'utf8'));}\n`,
);
const react = await readFile(resolve(root, 'fixtures/standard-sites/react.tsx'), 'utf8');
await writeFile(
  resolve(target, 'react.tsx'),
  react.replace('../standard-next/app/Site', './app/Site'),
);
await writeFile(resolve(target, 'next.config.mjs'), 'export default {devIndicators:false};\n');
await writeFile(
  resolve(target, 'tsconfig.json'),
  JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2022',
        lib: ['dom', 'dom.iterable', 'esnext'],
        strict: true,
        skipLibCheck: true,
        noEmit: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        jsx: 'react-jsx',
        esModuleInterop: true,
        resolveJsonModule: true,
        isolatedModules: true,
        plugins: [{ name: 'next' }],
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules'],
    },
    null,
    2,
  ),
);
await writeFile(
  resolve(target, 'serve-next.mjs'),
  `import {spawn} from 'node:child_process';\nimport {createRequire} from 'node:module';\nconst require=createRequire(new URL('./package.json',import.meta.url));\nconst child=spawn(process.execPath,[require.resolve('next/dist/bin/next'),'dev','--hostname','127.0.0.1','--port','3017'],{cwd:new URL('./',import.meta.url),env:process.env,stdio:'inherit',windowsHide:true});\nchild.on('error',()=>{process.exitCode=1;});\nchild.on('exit',code=>{process.exitCode=code??1;});\nfor(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>child.kill());\nprocess.once('exit',()=>child.kill());\n`,
);
console.log(
  `Prepared .cache/${consumerName}. Install there with npm install --ignore-scripts, then run test:standard with STANDARD_PACKED_CONSUMER=true${registry ? ' and STANDARD_SDK_REGISTRY=true' : ''}. No installation, account changes or submission performed by preparation.`,
);
