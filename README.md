# Typescript all the things

TypeScript-based CI configuration for Rust projects. Replaces static YAML configs with type-safe builders.

## Architecture

### Config Generation Flow

1. **User defines config** in `.github/rust-ci.ts` using `createRustWorkflow()` builder
2. **Action generates JSON** via `dougefresh/ci@main` (runs `scripts/generate-rust.ts`)
3. **Workflow consumes JSON** using `fromJSON()` to populate job matrices and conditionals

### Actions

**`dougefresh/ci@main`** (this repo's `action.yml`)
- Copies `.github/rust-ci.ts` from calling repo
- Executes `scripts/generate-rust.ts` with Bun
- Outputs JSON config string

**`.github/actions/rust-config/action.yml`**
- Wraps `dougefresh/ci@main`
- Replaces runner placeholders (`vars.RUNNER_ARM64`, `vars.RUNNER_AMD64`) with actual runner names
- Used by workflows to get final config with resolved runners

**`.github/actions/rust-init/action.yml`**
- Checks out code
- Sets up Rust toolchains (stable + nightly)
- Installs OS-specific packages from config
- Configures caching

### Workflow Pattern

`.github/workflows/rust.yml` demonstrates the pattern:

1. **config job**: Calls `rust-config` action → outputs JSON
2. **downstream jobs**: Use `fromJSON(needs.config.outputs.config)` to:
   - Control job execution (`if` conditions)
   - Populate matrices (toolchains, features, OS)
   - Extract run commands and flags

Each job checks `fromJSON(needs.config.outputs.config).jobs.<job_name>.if` before running.

### Example Config

```typescript
// .github/rust-ci.ts
import { createRustWorkflow } from '@dougefresh/ci';

export default function () {
  return createRustWorkflow()
    .semver(false)
    .clippy({ flags: '-D warnings' })
    .extra('integration-tests', 'cargo test --test integration')
    .build();
}
```

Generates JSON consumed by workflow jobs via `fromJSON()`.
