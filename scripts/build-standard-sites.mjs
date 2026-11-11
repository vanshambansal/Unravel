import {build} from '../packages/sdk/node_modules/esbuild/lib/main.js';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {mkdir,writeFile} from 'node:fs/promises';
const app=createRequire(new URL('../apps/web/package.json',import.meta.url));
await mkdir('.cache',{recursive:true});
for(const name of ['react','next'])await writeFile(`.cache/standard-${name}-config.json`,JSON.stringify({projectId:null,applicationOrigin:'http://localhost:3016',fixed:false}));
await build({entryPoints:['fixtures/standard-sites/react.tsx'],outfile:'.cache/standard-react.js',bundle:true,platform:'browser',format:'iife',jsx:'automatic',alias:{react:app.resolve('react'),'react/jsx-runtime':app.resolve('react/jsx-runtime'),'react-dom/client':app.resolve('react-dom/client'),'@unravel/sdk':fileURLToPath(new URL('../packages/sdk/dist/index.js',import.meta.url))}});
