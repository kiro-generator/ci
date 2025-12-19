import { zodToJsonSchema } from 'zod-to-json-schema';
import { ConfigSchemaLsp } from '../src/main';
import fs from 'fs';

const jsonSchema = zodToJsonSchema(ConfigSchemaLsp, 'RustCIConfig');

// Write JSON Schema
fs.writeFileSync('schemas/rust-ci-config.schema.json', JSON.stringify(jsonSchema, null, 2));

console.log('Schema generated at schemas/rust-ci-config.schema.json');
