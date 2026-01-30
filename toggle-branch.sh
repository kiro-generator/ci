#!/bin/bash

# Get current branch name
CURRENT_BRANCH=$(git branch --show-current)

if [[ -z "$CURRENT_BRANCH" ]]; then
  echo "Error: Could not determine current branch"
  exit 1
fi

# Detect OS for sed compatibility
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS (BSD sed)
  SED_INPLACE="sed -i ''"
else
  # Linux (GNU sed)
  SED_INPLACE="sed -i"
fi

# Function to replace @main with @current-branch
to_branch() {
  echo "Replacing @main with @$CURRENT_BRANCH in .github files..."
  git ls-files '.github/**/*.yml' '.github/**/*.yaml' | grep -v '.github/actions/jobtaker/action.yml' | xargs $SED_INPLACE "/anthropics\/claude-code-action@main/! s/@main/@$CURRENT_BRANCH/g"
  echo "Done!"
}

# Function to replace @current-branch with @main
to_main() {
  echo "Replacing @$CURRENT_BRANCH with @main in .github files..."
  git ls-files '.github/**/*.yml' '.github/**/*.yaml' | grep -v '.github/actions/jobtaker/action.yml' | xargs $SED_INPLACE "/anthropics\/claude-code-action@/! s/@$CURRENT_BRANCH/@main/g"
  echo "Done!"
}

# Check argument or auto-detect
if [[ "$1" == "main" ]]; then
  to_main
elif [[ "$1" == "branch" ]]; then
  to_branch
else
  # Auto-detect: if we find current branch refs, switch to main, otherwise switch to branch
  if git ls-files '.github/**/*.yml' '.github/**/*.yaml' | grep -v '.github/actions/jobtaker/action.yml' | xargs grep -l "@$CURRENT_BRANCH" >/dev/null 2>&1; then
    echo "Found @$CURRENT_BRANCH references, switching to @main"
    to_main
  else
    echo "No @$CURRENT_BRANCH references found, switching to @$CURRENT_BRANCH"
    to_branch
  fi
fi
