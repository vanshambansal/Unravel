import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
export async function settings(){return JSON.parse(await readFile(resolve('../../.cache/standard-next-config.json'),'utf8'));}
