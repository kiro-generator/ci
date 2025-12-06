import * as core from '@actions/core';
import fs from 'fs';
import { z } from 'zod';

export const ConfigSchema = z.object({
  runner: z.string().optional(),
  global: z.object({
    ubuntu_packages: z.string().optional(),
    toolchains: z.array(z.string()).default(['stable', 'nightly']),
    features: z.array(z.string()).default(['default']),
    rustlog: z.string().default('info'),
    fireblocks: z.object({
      enabled: z.boolean().default(false),
      'set-env-vars': z.boolean().default(true),
    }),
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
});

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
