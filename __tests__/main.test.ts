/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core module is mocked in this test,
 * so that the actual '@actions/core' module is not imported.
 */
import { jest } from '@jest/globals';
import * as core from '../__fixtures__/core.js';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core);

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { run } = await import('../src/main.js');

describe('main.ts', () => {
  beforeEach(() => {
    const raw = fs.readFileSync('.github/ci-configs/rust-default.yml', 'utf8');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config: any = yaml.load(raw, { json: true });
    config['ai'] = {
      enabled: true,
      allowed_bots: '*',
      claude_args: '--allowedTools',
      use_sticky_comment: false,
      track_progress: true,
      prompt: 'blah',
    };
    // Set the action's inputs as return values from core.getInput().
    core.getInput.mockImplementation(() => JSON.stringify(config));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Sets the time output', async () => {
    await run();
    expect(core.setOutput).toHaveBeenNthCalledWith(1, 'config', expect.stringMatching(/^{/));
  });
});
