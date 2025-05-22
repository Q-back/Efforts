#!/bin/sh

# This script triggers the GitHub Actions workflow manually
# Usage: ./trigger-deploy.sh [branch]

BRANCH=${1:-master}
REPO_OWNER=$(git remote -v | grep -o 'github.com[:/]\S\+' | head -1 | sed 's/.*github.com[:\/]\([^\/]*\).*/\1/')
REPO_NAME=$(basename -s .git $(git config --get remote.origin.url))

echo "Triggering GitHub Actions workflow on branch $BRANCH for $REPO_OWNER/$REPO_NAME"

# You need to have the GitHub CLI installed and authenticated
# Install it with: brew install gh
# Then login with: gh auth login
gh workflow run deploy.yml --ref $BRANCH

echo "Workflow dispatch sent. Check the status at https://github.com/$REPO_OWNER/$REPO_NAME/actions"
