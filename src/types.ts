export enum Arch {
  ARM64 = 'vars.RUNNER_ARM64',
  AMD64 = 'vars.RUNNER_AMD64',
  WIN = 'vars.RUNNER_WIN',
  MAC = 'vars.RUNNER_MAC',
}

export interface PageJob {
  if: boolean | string;
  path: string;
  version: string;
  command: string;
}

export interface PageJobs {
  mdbook: PageJob;
}

export interface AiJob {
  enabled: boolean;
  allowed_bots: string;
  claude_args: string;
  use_sticky_comment: boolean;
  track_progress: boolean;
  prompt: string;
}

export interface Global {
  // to match $RUNNER_OS
  packages: {
    Linux?: string;
    macOS?: string;
    Windows?: string;
  };
}

export interface BaseJob {
  if: boolean | string;
  continueOnError: boolean | string;
  run?: string;
}

export interface Matrix {
  os: Arch[];
  toolchains: string[];
  features: string[];
}

export interface Fmt extends BaseJob {}
export interface SemVer extends BaseJob {}
export interface Hack extends BaseJob {}
export interface CargoSort extends BaseJob {}
export interface DocCheck extends BaseJob {}
export interface Dependencies extends BaseJob {}
export interface Extra extends BaseJob {
  name: string;
  matrix: Matrix;
}
export interface Sanitizers {
  enabled: boolean;
  address: BaseJob;
  leak: BaseJob;
  thread: BaseJob;
}
export interface Clippy extends BaseJob {
  flags: string;
  matrix: Matrix;
}

export interface Coverage extends BaseJob {
  matrix: Matrix;
}

export interface RustJobs {
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

export interface Release {
  bin: boolean;
  publish: boolean;
  debian: boolean;
  profile: string;
  os: Arch[];
}
