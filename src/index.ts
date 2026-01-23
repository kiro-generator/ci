import { type AiJob, PROMPT } from './ai.js';

export enum Arch {
  ARM64 = 'vars.RUNNER_ARM64',
  AMD64 = 'vars.RUNNER_AMD64',
  WIN = 'vars.RUNNER_WIN',
  MAC = 'vars.RUNNER_MAC',
}
interface Global {
  // to match $RUNNER_OS
  packages: {
    Linux?: string;
    macOS?: string;
    Windows?: string;
  };
}

interface BaseJob {
  if: boolean | string;
  continueOnError: boolean | string;
  run?: string;
}

interface Matrix {
  os: Arch[];
  toolchains: string[];
  features: string[];
}

interface Fmt extends BaseJob {}
interface SemVer extends BaseJob {}
interface Hack extends BaseJob {}
interface CargoSort extends BaseJob {}
interface DocCheck extends BaseJob {}
interface Dependencies extends BaseJob {}
interface Extra extends BaseJob {
  name: string;
  matrix: Matrix;
}
interface Sanitizers {
  enabled: boolean;
  address: BaseJob;
  leak: BaseJob;
  thread: BaseJob;
}
interface Clippy extends BaseJob {
  flags: string;
  matrix: Matrix;
}

interface Coverage extends BaseJob {
  matrix: Matrix;
}

interface RustJobs {
  clippy: Clippy;
  coverage: Coverage;
  cargoSort: CargoSort;
  dependencies: Dependencies;
  docCheck: DocCheck;
  fmt: Fmt;
  hack: Hack;
  sanitizers: Sanitizers;
  semver: SemVer;
  extra: Extra;
}

interface Release {
  publish: boolean;
  debian: boolean;
  profile: string;
  os: Arch[];
}

export const JobDefaults: RustJobs = {
  fmt: {
    if: true,
    continueOnError: false,
    run: 'cargo +nightly fmt --check --all',
  } as Fmt,
  semver: {
    if: true,
    continueOnError: false,
  } as SemVer,
  hack: {
    if: true,
    continueOnError: false,
    run: 'cargo hack --feature-powerset check',
  } as Hack,
  docCheck: {
    if: true,
    continueOnError: false,
    run: 'cargo +nightly docs-rs',
  } as DocCheck,
  cargoSort: {
    if: true,
    continueOnError: false,
    run: 'if [ -f ./scripts/cargo-sort.sh ]; then\n  ./scripts/cargo-sort.sh\nelse\n  cargo sort -c -g\nfi\n',
  } as CargoSort,
  dependencies: {
    if: true,
    continueOnError: false,
    run: 'cargo machete --with-metadata',
  } as Dependencies,
  sanitizers: {
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
  } as Sanitizers,

  coverage: {
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
  } as Coverage,

  clippy: {
    if: true,
    continueOnError: false,
    run: '',
    flags: '',
    matrix: {
      os: [Arch.ARM64],
      toolchains: ['stable'],
      features: ['default'],
    },
  } as Clippy,
  extra: {
    if: false,
    continueOnError: false,
    run: '',
    name: 'extra',
    matrix: {
      os: [Arch.ARM64],
      toolchains: ['stable'],
      features: ['default'],
    },
  },
};

export class RustWorkflow {
  private jobs: RustJobs;
  private global: Global;
  private release: Release;
  private ai: AiJob;

  constructor() {
    this.jobs = {
      fmt: structuredClone(JobDefaults.fmt),
      docCheck: structuredClone(JobDefaults.docCheck),
      semver: structuredClone(JobDefaults.semver),
      dependencies: structuredClone(JobDefaults.dependencies),
      hack: structuredClone(JobDefaults.hack),
      cargoSort: structuredClone(JobDefaults.cargoSort),
      sanitizers: structuredClone(JobDefaults.sanitizers),
      clippy: structuredClone(JobDefaults.clippy),
      coverage: structuredClone(JobDefaults.coverage),
      extra: structuredClone(JobDefaults.extra),
    };

    this.global = { packages: {} };
    this.release = {
      publish: true,
      debian: false,
      profile: 'release',
      os: [Arch.AMD64],
    };
    this.ai = {
      prompt: PROMPT,
      additional: '',
      enabled: true,
      track_progress: true,
      allowed_bots: '*',
      claude_args:
        ' --allowedTools "mcp__github_inline_comment__create_inline_comment,Bash(cargo .*),Bash(gh pr comment:*),Bash(gh pr diff:*),Bash(gh pr view:*)"',
      use_sticky_comment: false,
    };
  }

  linuxPackages(packages: string[]) {
    this.global.packages.Linux = packages.join(',');
    return this;
  }

  semver(enable: boolean) {
    this.jobs.semver.if = enable;
    return this;
  }

  extra(name: string, run: string) {
    this.jobs.extra.if = true;
    this.jobs.extra.name = name;
    this.jobs.extra.run = run;
    return this;
  }

  clippy(opts?: Partial<Clippy>) {
    if (opts?.flags) this.jobs.clippy.flags = opts.flags;
    if (opts?.run) this.jobs.clippy.run = opts.run;
    if (opts?.if !== undefined) this.jobs.clippy.if = opts.if;
    if (opts?.continueOnError !== undefined) this.jobs.clippy.continueOnError = opts.continueOnError;
    if (opts?.matrix) {
      if (opts.matrix.toolchains) this.jobs.clippy.matrix.toolchains = opts.matrix.toolchains;
      if (opts.matrix.features) this.jobs.clippy.matrix.features = opts.matrix.features;
      if (opts.matrix.os) this.jobs.clippy.matrix.os = opts.matrix.os;
    }
    return this;
  }

  disableSanitizers() {
    this.jobs.sanitizers.enabled = false;
    return this;
  }

  disableAi() {
    this.ai.enabled = false;
    return this;
  }

  build() {
    //   os:
    //     - target: aarch64-unknown-linux-gnu
    //       os: ubicloud-standard-8-arm
    //     - target: x86_64-unknown-linux-gnu
    //       os: ubicloud-standard-4
    //     - target: aarch64-apple-darwin
    //       os: macos-latest
    // #    - target: x86_64-pc-windows-msvc
    // #      os: windows-latest
    return {
      ai: this.ai,
      release: {
        publish: this.release.publish,
        debian: this.release.debian,
        profile: this.release.profile,
        matrix: {
          os: [Arch.AMD64],
          target: ['x86_64-unknown-linux-gnu'],
        },
      },
      global: this.global,
      jobs: this.jobs,
    };
  }
}

export function createRustWorkflow(): RustWorkflow {
  return new RustWorkflow();
}
