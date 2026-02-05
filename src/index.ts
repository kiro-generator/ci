import {
  DEFAULT_AI,
  DEFAULT_CARGO_SORT,
  DEFAULT_CLIPPY,
  DEFAULT_COVERAGE,
  DEFAULT_DEPENDENCIES,
  DEFAULT_DOC_CHECK,
  DEFAULT_EXTRA,
  DEFAULT_FMT,
  DEFAULT_HACK,
  DEFAULT_PAGES,
  DEFAULT_SANITIZERS,
  DEFAULT_SEMVER,
} from './defaults';
import { type AiJob, Arch, type Clippy, type Global, type PageJobs, type Release, type RustJobs } from './types';

export * from './types';

export const JobDefaults: RustJobs = {
  fmt: DEFAULT_FMT,
  semver: DEFAULT_SEMVER,
  hack: DEFAULT_HACK,
  docCheck: DEFAULT_DOC_CHECK,
  cargoSort: DEFAULT_CARGO_SORT,
  dependencies: DEFAULT_DEPENDENCIES,
  sanitizers: DEFAULT_SANITIZERS,
  coverage: DEFAULT_COVERAGE,
  clippy: DEFAULT_CLIPPY,
  extra: DEFAULT_EXTRA,
};

export class RustWorkflow {
  private jobs: RustJobs;
  private global: Global;
  private release: Release;
  private ai: AiJob;
  private pages: PageJobs;

  constructor() {
    this.jobs = {
      fmt: JobDefaults.fmt,
      docCheck: JobDefaults.docCheck,
      semver: JobDefaults.semver,
      dependencies: JobDefaults.dependencies,
      hack: JobDefaults.hack,
      cargoSort: JobDefaults.cargoSort,
      sanitizers: JobDefaults.sanitizers,
      clippy: JobDefaults.clippy,
      coverage: JobDefaults.coverage,
      extra: JobDefaults.extra,
    };

    this.global = { packages: {} };
    this.release = {
      publish: true,
      bin: false,
      debian: false,
      profile: 'release',
      os: [Arch.AMD64],
    };
    this.ai = DEFAULT_AI;
    this.pages = DEFAULT_PAGES;
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

  withRelease(r: Release) {
    this.release = r;
    return this;
  }

  enableMdBook() {
    this.pages.mdbook.if = true;
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
      pages: this.pages,
      release: {
        bin: this.release.bin,
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
