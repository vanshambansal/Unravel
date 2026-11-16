import { build } from 'esbuild';
import { bundleOptions } from './configuration.mjs';
await build(bundleOptions());
