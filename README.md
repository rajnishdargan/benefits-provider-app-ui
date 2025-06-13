# UBI Provider UI (benefits-provider-app-ui)

## Description
This is a React based Frontend UI for Reference Provider App

## Project setup
```bash
$ yarn install
```

## Compile and run the project
```bash
# Start dev mode
$ yarn dev

# Create build
$ yarn build
```

# 🐕 Husky Git Hooks Setup Guide

## Manual Setup

```bash
# Install Husky hooks
npm run install && npm run prepare

# Set Git hooks path (required for Husky to work)
git config core.hooksPath .husky/_

# Verify hooks are executable
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg

# Check Git configuration
git config core.hooksPath
# Should output: .husky/_
```
