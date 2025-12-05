import * as core from '@actions/core';
/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const configs: string = core.getInput('configs');
    core.debug(`${configs}`);
    const finalConfig = {};
    core.setOutput('config', JSON.stringify(finalConfig));
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message);
  }
}
