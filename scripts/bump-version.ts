#!/usr/bin/env bun
import { readFileSync, writeFileSync } from 'node:fs';

const type = process.argv[2] || 'patch';
const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
const [major, minor, patch] = pkg.version.split('.').map(Number);

pkg.version =
  type === 'major'
    ? `${major + 1}.0.0`
    : type === 'minor'
      ? `${major}.${minor + 1}.0`
      : `${major}.${minor}.${patch + 1}`;

writeFileSync('package.json', `${JSON.stringify(pkg, null, 2)}\n`);
console.log(`Bumped to ${pkg.version}`);
