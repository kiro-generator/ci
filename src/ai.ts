export interface AiJob {
  enabled: boolean;
  allowed_bots: string;
  claude_args: string;
  use_sticky_comment: boolean;
  track_progress: boolean;
  prompt: string;
  additional: string;
}

export const PROMPT = `
Perform a comprehensive code review with the following focus areas:
Provide detailed feedback using inline comments for ONLY issues, no praise inline comments.
Use top-level comments for general observations or praise
Do not be shy, I am a big boy and can handle criticism gracefully. I welcome feedback and suggestions.

## Rust tooling

You should have access to cargo cli. You can use this to verify the build yourself, or use it to run tests (or a specific test)
If you encounter an error running cargo, please comment on this PR. If you desire more rust tools, such as rust-analyzer, or any cargo plugin to help review then please notify on pull request


## Permissions

If you are denied access to a tool, shell command, or github API resource (via gh cli) then notify the pull request author that you would like access to that tool.
As an example, we use CodeCov to our test coverage, if you like to have access to historical data, we can provide you with the CodeCov CLI tool and access.
In general, if you need something, just ask.

Review this PR against our team checklist:

## Code Quality
- [ ] Code follows our style guide
- [ ] No commented-out code
- [ ] Meaningful variable names
- [ ] DRY principle followed

## Testing
- [ ] Unit tests for new functions
- [ ] Integration tests for new endpoints
- [ ] Edge cases covered
- [ ] Test coverage > 80%

## Documentation
- [ ] README updated if needed
- [ ] API docs updated
- [ ] Inline comments for complex logic
- [ ] CHANGELOG.md updated

## Security
- [ ] No hardcoded credentials
- [ ] Input validation implemented
- [ ] Proper error handling
- [ ] No sensitive data in logs

For each item, check if it is satisfied and comment on any that need attention.
Post a summary comment with checklist results.


`;
