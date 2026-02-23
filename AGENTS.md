# AGENTS.md

Comprehensive developer guide for the MovieBox JS SDK project.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Rules](#rules)
- [Environment Setup](#environment-setup)
- [Project Structure](#project-structure)
- [Build Steps](#build-steps)
- [Testing](#testing)
- [Linting and Formatting](#linting-and-formatting)
- [Coding Conventions](#coding-conventions)
- [Error Handling](#error-handling)
- [Documentation Guidelines](#documentation-guidelines)
- [Versioning](#versioning)
- [Release Process](#release-process)
- [Security](#security)
- [Contributing](#contributing)

---

## Project Overview

MovieBox JS SDK is a resilient, fully-typed JavaScript/TypeScript SDK for interacting with MovieBox APIs. It provides a clean interface for searching movies/TV series, retrieving details, extracting streaming URLs, and downloading media content.

### Key Features

- **Search** — Find movies, TV series, and music with filtering and pagination
- **Details** — Get full metadata including ratings, subtitles, and quality options
- **Streaming** — Extract direct stream URLs with quality selection
- **Downloads** — Parallel chunked downloads with resume support and progress tracking
- **Session Management** — Automatic mirror fallback, retry policies, cookie handling
- **Proxy Support** — HTTP/HTTPS/SOCKS proxy routing via undici

---

## Technology Stack

| Category | Technology |
|----------|------------|
| Language | TypeScript 5.x |
| Runtime | Node.js 18+ |
| Package Manager | pnpm |
| Testing | Vitest |
| Linting | ESLint |
| Formatting | Prettier |
| HTTP Client | undici |
| Logging | pino |

---

## Rules

### General Rules

- Prefer TypeScript for all new code and examples
- Use clear, descriptive function and variable names
- Document all public APIs in the `docs/` folder
- Keep examples up-to-date with the main API
- Use pnpm for dependency management

### Git Workflow

- Use conventional commit messages (e.g., `feat:`, `fix:`, `docs:`)
- Create feature branches from `main`
- Run tests before committing
- Update documentation if changes affect public APIs

---

## Environment Setup

### Prerequisites

- Node.js 18.0.0 or later
- pnpm 8.0.0 or later

### Installation

```bash
# Install dependencies
pnpm install

# Verify the build
pnpm build

# Run tests
pnpm test
```

### Adding Dependencies

```bash
# Add production dependency
pnpm add <package>

# Add development dependency
pnpm add -D <package>

# Add TypeScript types
pnpm add -D @types/<package>
```

---

## Project Structure

```
moviebox-js-sdk/
├── src/                      # Source code
│   ├── index.ts            # Main exports
│   ├── session.ts          # Session management
│   ├── search.ts           # Search functionality
│   ├── details.ts          # Movie details
│   ├── series.ts           # Series/episode details
│   ├── stream.ts           # Streaming URLs
│   ├── download.ts         # Download functionality
│   ├── errors.ts           # Error classes
│   ├── types.ts            # TypeScript types
│   ├── logger.ts           # Logging utilities
│   ├── constants.ts        # Constants
│   └── __fixtures__/       # Test fixtures
├── docs/                    # Documentation
│   ├── api-reference.md   # API documentation
│   ├── types.md          # Type reference
│   ├── errors.md         # Error handling guide
│   ├── proxy.md          # Proxy configuration
│   └── guides/           # How-to guides
├── test/                    # Integration tests
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── eslintrc.cjs
└── prettierrc.json
```

---

## Build Steps

### Build Commands

```bash
# Build the project
pnpm build

# Build in development mode (faster)
pnpm build:dev

# Type checking only
pnpm typecheck

# Clean build artifacts
pnpm clean
```

### Build Configuration

- Uses `tsconfig.json` for TypeScript configuration
- Output goes to `dist/` directory
- Generates both `.js` and `.d.ts` files
- Source maps enabled for development

---

## Testing

### Test Commands

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test --coverage

# Run specific test file
pnpm test src/search.test.ts
```

### Test Guidelines

- Place tests alongside source files with `.test.ts` extension
- Use Vitest's describe/it/expect API
- Follow AAA pattern: Arrange, Act, Assert
- Add tests for all new features and bug fixes
- Include both happy path and error cases
- Mock external dependencies appropriately

### Test Structure

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { search } from './search.js';

describe('search', () => {
  beforeEach(() => {
    // Setup
  });

  it('should return search results', async () => {
    // Arrange
    const session = new MovieboxSession();
    
    // Act
    const result = await search(session, { query: 'test' });
    
    // Assert
    expect(result).toBeDefined();
    expect(result.results).toBeInstanceOf(Array);
  });
});
```

---

## Linting and Formatting

### Commands

```bash
# Run ESLint
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code with Prettier
pnpm format

# Check formatting without modifying
pnpm format:check
```

### Configuration

- ESLint: `.eslintrc.cjs`
- Prettier: `.prettierrc.json`
- Configurations are pre-tuned for the project

---

## Coding Conventions

### TypeScript

- Enable strict mode in TypeScript
- Prefer explicit types over `any`
- Use `interface` for object shapes, `type` for unions/aliases
- Export types separately from implementations when needed

### ES Modules

- Use ES modules (`import`/`export`)
- Include `.js` extension in relative imports
- Use `import type` for type-only imports

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Classes/Interfaces | PascalCase | `MovieboxSession` |
| Functions/Variables | camelCase | `getMovieDetails` |
| Constants | SCREAMING_SNAKE_CASE | `DEFAULT_TIMEOUT` |
| Files | kebab-case | `session-manager.ts` |
| Types | PascalCase | `SearchResult` |

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Use trailing commas
- Maximum line length: 100 characters
- Prefer async/await over raw promises

### Example

```typescript
import type { MovieDetails } from './types.js';

export interface MovieServiceOptions {
  timeout: number;
  retries: number;
}

export class MovieService {
  private readonly baseUrl: string;
  
  constructor(private readonly options: MovieServiceOptions) {
    this.baseUrl = 'https://api.example.com';
  }
  
  async getMovieDetails(id: string): Promise<MovieDetails> {
    const response = await fetch(`${this.baseUrl}/movies/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch movie: ${response.status}`);
    }
    
    return response.json();
  }
}
```

---

## Error Handling

### Error Class Hierarchy

```
Error
└── MovieboxApiError
    ├── MovieboxHttpError
    ├── EmptyResponseError
    ├── UnsuccessfulResponseError
    ├── GeoBlockedError
    ├── MirrorExhaustedError
    └── RetryLimitExceededError
```

### Guidelines

- All SDK errors should extend `MovieboxApiError`
- Include meaningful error messages
- Add context properties (url, status, etc.) where relevant
- Document when each error type is thrown
- Use error codes for machine-readable error identification

---

## Documentation Guidelines

### API Documentation

Document all public exports with:

- Function signature with parameter types
- Description of what the function does
- Parameter table with type, required status, default values
- Return type and description
- Example usage
- Throws section for possible errors

### Parameter Tables

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `detailPath` | `string` | Yes | - | Detail path slug |
| `quality` | `DownloadQuality` | No | `'best'` | Download quality |

### Examples

Include practical, runnable examples that demonstrate:

- Basic usage
- Error handling
- Common patterns

```typescript
import { search } from 'moviebox-js-sdk';

const session = new MovieboxSession();

const results = await search(session, { query: 'Inception' });
console.log(results.results[0]?.title);
```

---

## Versioning

This project uses [Semantic Versioning](https://semver.org/).

Given a version number `MAJOR.MINOR.PATCH`:

- **MAJOR** version: Incompatible API changes
- **MINOR** version: New functionality in a backward-compatible manner
- **PATCH** version: Backward-compatible bug fixes

### Version Naming

- Use git tags for releases
- Update CHANGELOG.md before each release
- Follow conventional commits for automatic version bumping

---

## Release Process

### Steps

1. Update version in `package.json`
2. Update CHANGELOG.md with release date
3. Run full test suite
4. Build the project
5. Create git tag
6. Publish to npm

```bash
pnpm version patch  # or minor/major
pnpm build
npm publish
git push && git push --tags
```

---

## Security

### Guidelines

- Never hardcode sensitive data in source code
- Use environment variables for API keys and secrets
- Validate and sanitize user input
- Use HTTPS for production connections
- Follow security best practices in SECURITY.md

### Vulnerability Reporting

See [SECURITY.md](./SECURITY.md) for how to report security vulnerabilities.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed contribution guidelines.

### Quick Start

1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make changes and add tests
5. Submit a pull request

---

## Additional Notes

- Keep documentation in the `docs/` folder clear and concise
- Update ROADMAP.md for major changes or planned features
- Place context-specific AGENTS.md files in subdirectories if needed for specialized instructions
