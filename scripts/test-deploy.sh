#!/bin/sh

# This script builds the app in production mode and serves it locally for testing
# Usage: ./test-deploy.sh

echo "Building app in production mode..."
NODE_ENV=production pnpm build

echo "Starting local server on port 4173..."
pnpm preview --base=/Efforts/

echo "Open http://localhost:4173/Efforts/ in your browser to test the production build."
