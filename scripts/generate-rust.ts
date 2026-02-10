import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const configPath = resolve(process.cwd(), '.github/rust-ci.ts');
const userConfig = await import(pathToFileURL(configPath).href);
const config = userConfig.default();

const promptPath = resolve(process.cwd(), 'claude-prompt.md');
if (!existsSync(promptPath)) {
  console.error('::error::claude-prompt.md not found - AI validation will be skipped');
  process.exit(1);
}

const prompt = readFileSync(promptPath, 'utf-8');
config.ai.prompt = prompt;

// .replaceAll('`', '')
// .replaceAll("'", "'")
// .replaceAll("'", "'")
// .replaceAll('"', '"')
// .replaceAll('"', '"');

console.log(JSON.stringify(config, null, 2));
