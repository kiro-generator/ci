import * as core from '@actions/core';
import fs from 'fs';
import { z } from 'zod/v3';

export const ConfigSchema = z
  .object({
    runner: z.string().optional(),
    ai: z.object({
      enabled: z.boolean().default(true),
      allowed_bots: z.string().default('*'),
      claude_args: z.string().optional(),
      use_sticky_comment: z.boolean().default(false),
      track_progress: z.boolean().default(true),
      settings: z.any().optional().default({}),
      prompt: z.string(),
    }),
    global: z.object({
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
    }),
    release: z.object({
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
    }),
    jobs: z.object({
      coverage: z.object({
        if: z.boolean(),
        'continue-on-error': z.boolean(),
        args: z.string(),
        run: z.string(),
        matrix: z.object({
          os: z.array(z.string()).default([]),
          toolchains: z.array(z.string()).default(['stable']),
          features: z.array(z.string()).default(['default']),
        }),
      }),
      fmt: z.object({
        if: z.boolean(),
        'continue-on-error': z.boolean(),
        run: z.string(),
      }),
      clippy: z.object({
        if: z.boolean(),
        'continue-on-error': z.boolean(),
        flags: z.string(),
        matrix: z.object({
          os: z.array(z.string()).default([]),
          toolchains: z.array(z.string()).default(['stable', 'nightly']),
          features: z.array(z.string()).default(['default']),
        }),
      }),
      semver: z.object({
        if: z.boolean(),
        'continue-on-error': z.boolean(),
      }),
      hack: z.object({
        if: z.boolean(),
        'continue-on-error': z.boolean(),
        run: z.string(),
      }),
      doc: z.object({
        if: z.boolean(),
        'continue-on-error': z.boolean(),
        run: z.string(),
      }),
      dependencies: z.object({
        if: z.boolean(),
        'continue-on-error': z.boolean(),
        run: z.string(),
      }),
      'cargo-sort': z.object({
        if: z.boolean(),
        'continue-on-error': z.boolean(),
        run: z.string(),
      }),
      extra: z
        .object({
          if: z.boolean().default(false),
          'continue-on-error': z.boolean().default(false),
          name: z.string().default('extra'),
          run: z.string().default('echo "Running extra job"'),
          matrix: z.object({
            os: z.array(z.string()).default([]),
            toolchains: z.array(z.string()).default(['stable']),
            features: z.array(z.string()).default(['default']),
          }),
        })
        .optional(),
      sanitizers: z.object({
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
      }),
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
