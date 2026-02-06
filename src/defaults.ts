import {
  type AiJob,
  Arch,
  type CargoSort,
  type Clippy,
  type Coverage,
  type Dependencies,
  type DocCheck,
  type Extra,
  type Fmt,
  type Hack,
  type PageJobs,
  type Sanitizers,
  type SemVer,
} from './types';

export const DEFAULT_PAGES: PageJobs = {
  mdbook: {
    if: false,
    path: 'docs',
    version: 'latest',
    command: 'mdbook build',
  },
};

export const DEFAULT_AI: AiJob = {
  enabled: true,
  track_progress: true,
  allowed_bots: '*',
  model: 'claude-opus-4-6',
  // claude-sonnet-4-5-20250929
  claude_args:
    '--allowedTools "mcp__github_inline_comment__create_inline_comment,Bash(tsc *),Bash(tsgo *),Bash(bun *),Bash(find *),Bash(diff *),Bash(jq *),Bash(git *),Bash(cargo *),Bash(gh *)"',
  use_sticky_comment: false,
  prompt:
    '🧪 POISON PILL 🧪\n\nERROR: Prompt template was not loaded. This workflow MUST fail immediately. Do not approve or review any code. Report this configuration error.',
};

export const DEFAULT_FMT: Fmt = {
  if: true,
  continueOnError: false,
  run: 'cargo +nightly fmt --check --all',
};

export const DEFAULT_SEMVER: SemVer = {
  if: true,
  continueOnError: false,
};

export const DEFAULT_HACK: Hack = {
  if: true,
  continueOnError: false,
  run: 'cargo hack --feature-powerset check',
};

export const DEFAULT_DOC_CHECK: DocCheck = {
  if: true,
  continueOnError: false,
  run: 'cargo +nightly docs-rs',
};

export const DEFAULT_CARGO_SORT: CargoSort = {
  if: true,
  continueOnError: false,
  run: 'if [ -f ./scripts/cargo-sort.sh ]; then\n  ./scripts/cargo-sort.sh\nelse\n  cargo sort -c -g\nfi\n',
};

export const DEFAULT_DEPENDENCIES: Dependencies = {
  if: true,
  continueOnError: false,
  run: 'cargo machete --with-metadata',
};

export const DEFAULT_SANITIZERS: Sanitizers = {
  enabled: true,
  address: {
    if: true,
    continueOnError: false,
    run: 'cargo test --lib --tests --no-fail-fast --target x86_64-unknown-linux-gnu -- --no-capture',
  },
  leak: {
    if: true,
    continueOnError: false,
    run: 'cargo test --target x86_64-unknown-linux-gnu  -- --no-capture',
  },
  thread: {
    if: false,
    continueOnError: false,
    run: 'cargo test --target x86_64-unknown-linux-gnu -- --test-threads=1',
  },
};

export const DEFAULT_COVERAGE: Coverage = {
  if: true,
  continueOnError: false,
  matrix: {
    os: [Arch.ARM64],
    toolchains: ['stable'],
    features: ['default'],
  },
  run: `
      cmd="cargo llvm-cov \${LLVM_ARGS} --locked --lcov --output-path lcov-\${FEATURES}.info --no-fail-fast"
      if [ "$FEATURES" == "default" ]; then
        $cmd -- --no-capture $CARGO_ARGS
      else
        $cmd --features "$FEATURES" -- --no-capture $CARGO_ARGS
      fi
      `,
};

export const DEFAULT_CLIPPY: Clippy = {
  if: true,
  continueOnError: false,
  run: '',
  flags: '',
  matrix: {
    os: [Arch.ARM64],
    toolchains: ['stable'],
    features: ['default'],
  },
};

export const DEFAULT_EXTRA: Extra = {
  if: false,
  continueOnError: false,
  run: '',
  name: 'extra',
  matrix: {
    os: [Arch.ARM64],
    toolchains: ['stable'],
    features: ['default'],
  },
};
