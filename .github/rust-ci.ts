import { createRustWorkflow } from '@dougefresh/ci';

export default function () {
  if (process.env.CONTEXT) {
    console.error(`context: ${process.env.CONTEXT}`);
  }
  return createRustWorkflow()
    .enableMdBook()
    .extraJob('test-extra', { run: 'echo hello' })
    .disableCoverage()
    .semver(false)
    .disableSanitizers()
    .build();
}
