import { createRustWorkflow } from '@dougefresh/ci';

export default function () {
  if (process.env.CONTEXT) {
    console.log(`context: ${process.env.CONTEXT}`);
  }
  return createRustWorkflow()
    .enableMdBook()
    .extra('test-extra', 'echo hello')
    .disableCoverage()
    .semver(false)
    .disableSanitizers()
    .build();
}
