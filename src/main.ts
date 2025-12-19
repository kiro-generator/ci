import * as core from '@actions/core';
import fs from 'fs';
import { z } from 'zod/v3';

function schema_pages() {
  return z.object({
    mdbook: z
      .object({
        if: z.boolean().default(false),
        version: z.string().default('latest'),
        path: z.string().default('docs'),
        command: z.string().default('mdbook build'),
      })
      .optional(),
  });
}

function schema_ai() {
  return z.object({
    enabled: z.boolean().default(true),
    allowed_bots: z.string().default('*'),
    claude_args: z.string().optional(),
    use_sticky_comment: z.boolean().default(false),
    track_progress: z.boolean().default(true),
    settings: z.any().optional().default({}),
    prompt: z.string(),
  });
}

function schema_global() {
  return z.object({
    packages: z.object({
      Linux: z.string().optional(),
      macOS: z.string().optional(),
      Windows: z.string().optional(),
    }),
    toolchains: z.array(z.string()).default(['stable', 'nightly']),
    features: z.array(z.string()).default(['default']),
    rustlog: z.string().default('info'),
    fireblocks: z.object({
      enabled: z.boolean().default(false),
      'set-env-vars': z.boolean().default(true),
    }),
  });
}

function schema_release() {
  return z.object({
    cargo_publish: z.boolean().default(true),
    profile: z.string().default('release'),
    os: z
      .array(
        z.object({
          target: z.string(),
          os: z.string(),
          features: z.array(z.string()).optional(),
        }),
      )
      .default([
        {
          target: 'x86_64-unknown-linux-gnu',
          os: 'ubicloud-standard-4',
        },
        {
          target: 'aarch64-apple-darwin',
          os: 'macos-latest',
        },
      ]),
  });
}

function schema_job_coverage() {
  return z.object({
    if: z.boolean(),
    'continue-on-error': z.boolean(),
    args: z.string(),
    run: z.string(),
    matrix: z.object({
      os: z.array(z.string()).default([]),
      toolchains: z.array(z.string()).default(['stable']),
      features: z.array(z.string()).default(['default']),
    }),
  });
}

function schema_job_fmt() {
  return z.object({
    if: z.boolean(),
    'continue-on-error': z.boolean(),
    run: z.string(),
  });
}

function schema_job_clippy() {
  return z.object({
    if: z.boolean(),
    'continue-on-error': z.boolean(),
    flags: z.string(),
    matrix: z.object({
      os: z.array(z.string()).default([]),
      toolchains: z.array(z.string()).default(['stable', 'nightly']),
      features: z.array(z.string()).default(['default']),
    }),
  });
}

function schema_job_semver() {
  return z.object({
    if: z.boolean(),
    'continue-on-error': z.boolean(),
  });
}

function schema_job_hack() {
  return z.object({
    if: z.boolean(),
    'continue-on-error': z.boolean(),
    run: z.string(),
  });
}

function schema_job_doc() {
  return z.object({
    if: z.boolean(),
    'continue-on-error': z.boolean(),
    run: z.string(),
  });
}

function schema_job_dependencies() {
  return z.object({
    if: z.boolean(),
    'continue-on-error': z.boolean(),
    run: z.string(),
  });
}

function schema_job_cargo_sort() {
  return z.object({
    if: z.boolean(),
    'continue-on-error': z.boolean(),
    run: z.string(),
  });
}

function schema_job_extra() {
  return z.object({
    if: z.boolean().default(false),
    'continue-on-error': z.boolean().default(false),
    name: z.string().default('extra'),
    run: z.string().default('echo "Running extra job"'),
    matrix: z.object({
      os: z.array(z.string()).default([]),
      toolchains: z.array(z.string()).default(['stable']),
      features: z.array(z.string()).default(['default']),
    }),
  });
}

function schema_job_sanitizers() {
  return z.object({
    enabled: z.boolean(),
    matrix: z.object({
      os: z.array(z.string()).default([]),
      features: z.array(z.string()),
    }),
    address: z.object({
      if: z.boolean(),
      'continue-on-error': z.boolean(),
      run: z.string(),
    }),
    leak: z.object({
      if: z.boolean(),
      'continue-on-error': z.boolean(),
      run: z.string(),
    }),
    thread: z.object({
      if: z.boolean(),
      'continue-on-error': z.boolean(),
      run: z.string(),
    }),
  });
}

export const ConfigSchemaLsp = z
  .object({
    runner: z.string().optional(),
    pages: schema_pages().optional(),
    ai: schema_ai().optional(),
    global: schema_global().optional(),
    release: schema_release().optional(),
    jobs: z
      .object({
        coverage: schema_job_coverage().optional(),
        fmt: schema_job_fmt().optional(),
        clippy: schema_job_clippy().optional(),
        semver: schema_job_semver().optional(),
        hack: schema_job_hack().optional(),
        doc: schema_job_doc().optional(),
        dependencies: schema_job_dependencies().optional(),
        'cargo-sort': schema_job_cargo_sort().optional(),
        extra: schema_job_extra().optional(),
        sanitizers: schema_job_sanitizers().optional(),
      })
      .optional(),
  })
  .describe('RUST CI Configuration');

export const ConfigSchema = z
  .object({
    runner: z.string().optional(),
    pages: schema_pages(),
    ai: schema_ai(),
    global: schema_global(),
    release: schema_release(),
    jobs: z.object({
      coverage: schema_job_coverage(),
      fmt: schema_job_fmt(),
      clippy: schema_job_clippy(),
      semver: schema_job_semver(),
      hack: schema_job_hack(),
      doc: schema_job_doc(),
      dependencies: schema_job_dependencies(),
      'cargo-sort': schema_job_cargo_sort(),
      extra: schema_job_extra().optional(),
      sanitizers: schema_job_sanitizers(),
    }),
  })
  .describe('RUST CI Configuration');

type Config = z.infer<typeof ConfigSchema>;

export async function run(): Promise<void> {
  try {
    const configFilePath: string = core.getInput('config');
    core.debug(`${configFilePath}`);
    let configRaw: string;
    if (configFilePath.includes('{')) {
      configRaw = configFilePath;
    } else {
      configRaw = fs.readFileSync(configFilePath, 'utf8');
    }
    const finalConfig: Config = ConfigSchema.parse(JSON.parse(configRaw));
    finalConfig.runner = core.getInput('runner');
    if (!finalConfig.runner) {
      core.setFailed('runner is required');
    }
    const jobsWithMatrix = Object.entries(finalConfig.jobs)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unused-vars
      .filter(([_, job]) => 'matrix' in job && 'os' in (job as any).matrix)
      .map(([name]) => name);

    for (const jobName of jobsWithMatrix) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const job = finalConfig.jobs[jobName as keyof typeof finalConfig.jobs] as any;
      if (job.matrix.os.length === 0) {
        job.matrix.os.push(finalConfig.runner);
      }
    }
    core.setOutput('config', JSON.stringify(finalConfig));
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message);
  }
}
