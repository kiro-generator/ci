import { basename } from 'node:path';
import { Glob } from 'bun';

interface ReleaseAsset {
  glob: string;
  archiveName: string;
}

const assets: ReleaseAsset[] = JSON.parse(process.env.ASSETS || '[]');
const outputDir = process.env.OUTPUT_DIR || 'target';

if (!assets.length) {
  console.log('No assets to process');
  process.exit(0);
}

await Bun.write(`${outputDir}/.gitkeep`, '');

for (const asset of assets) {
  if (!asset.archiveName.endsWith('.tar.gz')) {
    console.error(`::error::archiveName must end with .tar.gz: ${asset.archiveName}`);
    process.exit(1);
  }
  const safeName = basename(asset.archiveName);
  if (safeName !== asset.archiveName) {
    console.error(`::error::archiveName contains path separators: ${asset.archiveName}`);
    process.exit(1);
  }

  const glob = new Glob(asset.glob);
  const files: Record<string, Uint8Array> = {};
  for (const path of glob.scanSync('.')) {
    files[path] = await Bun.file(path).bytes();
  }

  if (!Object.keys(files).length) {
    console.warn(`::warning::No files matched glob: ${asset.glob}`);
    continue;
  }

  const archive = new Bun.Archive(files, { compress: 'gzip' });
  const out = `${outputDir}/${asset.archiveName}`;
  await Bun.write(out, archive);
  console.log(`Created ${out} (${Object.keys(files).length} files)`);
}
