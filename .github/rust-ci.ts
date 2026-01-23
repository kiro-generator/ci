import { createRustWorkflow } from '@dougefresh/ci';

export default function () {
  return createRustWorkflow().extra('test-extra', 'echo hello').semver(false).build();
}
