import { createRustWorkflow } from '@dougefresh/ci';

export default function () {
  return createRustWorkflow()
    .enableMdBook()
    .extra('test-extra', 'echo hello')
    .semver(false)
    .disableSanitizers()
    .build();
}
