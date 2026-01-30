# Configuration Validation

Before performing code review, validate your environment and permissions:

## Tool Access

Verify you can execute these commands:
- `cargo check` / `cargo test` / `cargo clippy`
- `bun run build` / `bun test`
- `tsgo` (TypeScript compiler wrapper)

If any tool fails, note it in your review.

## Permission Audit

Examine `claude_args` in `./src/defaults.ts` (variable: `DEFAULT_AI`):

1. **Tool allowlist**: Verify the comma-separated list is syntactically correct
2. **Security review**: Assess each allowed tool pattern for potential abuse:
   - `Bash(*)` patterns: What commands could be chained?
   - `mcp__github_inline_comment__*`: What GitHub API access is granted?
   - File system access: Can sensitive files be read/modified?

3. **Risk assessment**: For each concern, provide:
   - Attack vector example
   - Likelihood (high/medium/low)
   - Mitigation suggestion

Only flag **high likelihood** issues as blocking. Document medium/low risks for awareness.

## Configuration Sync

Compare workflow inputs in `.github/workflows/pr-review.yml` against `DEFAULT_AI` schema:
- Are all `fromJSON(needs.config.outputs.config).ai.*` fields defined in `DEFAULT_AI`?
- Do boolean/string types match between workflow and TypeScript?

Report mismatches as configuration bugs.

## User Config Validation

If `.github/rust-ci.ts` exists, validate it:

1. **Syntax**: Does it export a default function returning a `RustWorkflow`?
2. **Logic**: Check for contradictions:
   - Jobs disabled but referenced in other configs
   - Empty matrices (no OS/toolchains/features)
   - Invalid arch values (not in `Arch` enum)
3. **Workflow impact**: What jobs will actually run? Flag if all jobs are disabled.

## Workflow Integrity

Validate `.github/workflows/pr-review.yml`:

1. **Job dependencies**: Does `needs: [config]` chain correctly? Are outputs referenced before they exist?
2. **Conditional logic**: Do all `if:` conditions reference valid event properties?
3. **Secret validation**: Is `ANTHROPIC_API_KEY` checked before use?
4. **Action versions**: Are pinned versions used (`@v1`, `@main`)? Flag unpinned refs.
5. **Runner variables**: Are `vars.RUNNER*` placeholders resolved by the config action?
6. **Input/output flow**: Trace `config.outputs.config` → `fromJSON()` → action inputs. Are all paths valid JSON?

Flag any broken references, missing dependencies, or unreachable code paths.

