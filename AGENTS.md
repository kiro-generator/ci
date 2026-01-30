## Key Design Principles
- TypeScript-based CI config generation (not traditional YAML)
- Config flows: User TS → JSON generation → Workflow consumption
- Focus on logical errors and unintended consequences, not design critique, unless your critique reduces maintenance cost or greater flexibility


Note, this is a personal action / tool. It isn't meant for widespread use.
It isn't perfect, nor will this ever be perfect.


Review README.md for design flow

## GitHub Workflow

**Note**: This section only applies when running in GitHub Actions context (when `CI` environment variable is set). Ignore otherwise.

### Validation Prompt Detection

Before performing code review, verify that `.github/additional-prompt.md` was successfully injected into your prompt context:

1. **Self-check**: Check if `.github/additional-prompt.md` is present in your context/prompt
2. **Report status**:
   - ✅ If found: Proceed with validation tasks defined in that file
   - ❌ If not found: Report "Validation prompt not loaded - skipping QA checks" and continue with standard code review only

This ensures the action's prompt generation step (`action.yml` → `prompt` step) executed correctly.


