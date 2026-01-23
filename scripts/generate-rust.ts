#!/usr/bin/env bun
import { resolve } from 'path';
import { pathToFileURL } from 'url';

const configPath = resolve(process.cwd(), '.github/rust-ci.ts');
const userConfig = await import(pathToFileURL(configPath).href);
const config = userConfig.default();

console.log(JSON.stringify(config, null, 2));
