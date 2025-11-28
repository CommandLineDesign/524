#!/bin/bash

# Script to start the API server with the correct Node version
# This ensures we use the Node version specified in .nvmrc

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Load nvm if available
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use the Node version from .nvmrc
if [ -f ".nvmrc" ]; then
  echo "📌 Switching to Node version specified in .nvmrc..."
  nvm use
  if [ $? -ne 0 ]; then
    echo "⚠️  Node version $(cat .nvmrc) not installed. Installing now..."
    nvm install
    nvm use
  fi
fi

echo "🚀 Starting API server on port 5524..."
cd packages/api
npm run dev

