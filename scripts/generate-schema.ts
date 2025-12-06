import { zodToJsonSchema } from 'zod-to-json-schema';
import { ConfigSchema } from '../src/main';
import fs from 'fs';

const jsonSchema = zodToJsonSchema(ConfigSchema, {
  name: 'RustCIConfig',
  $refStrategy: 'none', // Inline everything for simplicity
});

// Write JSON Schema
fs.writeFileSync('schemas/rust-ci-config.schema.json', JSON.stringify(jsonSchema, null, 2));

console.log('Schema generated at schemas/rust-ci-config.schema.json');
