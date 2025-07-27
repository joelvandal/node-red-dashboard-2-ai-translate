# Deployment Guide for @joelvandal/node-red-dashboard-2-ai-translate

This guide provides instructions for deploying the package to npm.

## Prerequisites

1. **npm account**: Ensure you have an npm account (username: joelvandal)
2. **Authentication**: Be logged into npm locally
3. **Permissions**: Have publish permissions for the @joelvandal scope

## Initial Setup

### 1. Login to npm
```bash
npm login
```
Enter your npm credentials when prompted.

### 2. Verify Authentication
```bash
npm whoami
```
This should display: `joelvandal`

## Deployment Process

### 1. Run Tests and Linting
Before deploying, ensure code quality:
```bash
npm run lint
```

Fix any issues:
```bash
npm run lint:fix
```

### 2. Update Version
Choose the appropriate version bump:

**Patch version** (bug fixes: 1.0.1 → 1.0.2):
```bash
npm run version:patch
```

**Minor version** (new features: 1.0.1 → 1.1.0):
```bash
npm run version:minor
```

**Major version** (breaking changes: 1.0.1 → 2.0.0):
```bash
npm run version:major
```

### 3. Test Package Locally
Create a package to verify contents:
```bash
npm run pack
```
This creates a `.tgz` file. Verify it contains all necessary files.

### 4. Publish to npm

**Standard release**:
```bash
npm run publish:public
```

**Beta release**:
```bash
npm run publish:beta
```

### 5. Verify Publication
Check the package on npm:
- https://www.npmjs.com/package/@joelvandal/node-red-dashboard-2-ai-translate

## Quick Deploy Commands

For a standard patch release:
```bash
npm run lint
npm run version:patch
npm run publish:public
```

## Rollback Procedures

### Unpublish (within 72 hours)
If you need to remove a version:
```bash
npm unpublish @joelvandal/node-red-dashboard-2-ai-translate@<version>
```

### Deprecate Version
For versions older than 72 hours:
```bash
npm deprecate @joelvandal/node-red-dashboard-2-ai-translate@<version> "Use version X.X.X instead"
```

## Version Guidelines

- **Patch** (X.X.n): Bug fixes, documentation updates
- **Minor** (X.n.X): New features, backwards compatible
- **Major** (n.X.X): Breaking changes, API changes

## Pre-deployment Checklist

- [ ] All tests pass
- [ ] Linting passes
- [ ] README.md is up to date
- [ ] CHANGELOG updated (if applicable)
- [ ] Version number updated
- [ ] Package.json dependencies are correct

## Troubleshooting

### Authentication Issues
```bash
npm logout
npm login
```

### Permission Denied
Ensure you're logged in as the correct user:
```bash
npm whoami
```

### Package Already Exists
Check current version:
```bash
npm view @joelvandal/node-red-dashboard-2-ai-translate version
```

## Support

For npm-related issues:
- npm documentation: https://docs.npmjs.com/
- npm support: https://www.npmjs.com/support