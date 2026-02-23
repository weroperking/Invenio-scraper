# Contributing to MovieBox JS SDK

Thank you for your interest in contributing to the MovieBox JS SDK! This document outlines the process for contributing to the project.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Pull Request Guidelines](#pull-request-guidelines)

---

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/). By participating, you are expected to uphold this code.

Please read the full [Code of Conduct](./CODE_OF_CONDUCT.md) before contributing.

---

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/pythonvista/moviebox-js-sdk.git
   cd moviebox-js-sdk
   ```

3. **Install dependencies**:
   ```bash
   pnpm install
   ```

4. **Verify the build**:
   ```bash
   pnpm build
   ```

5. **Run tests**:
   ```bash
   pnpm test
   ```

---

## Development Setup

### Prerequisites

- **Node.js** 18.0.0 or later
- **pnpm** for package management

### Install Dependencies

```bash
pnpm install
```

### Build the Project

```bash
pnpm build
```

### Run Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run with coverage
pnpm test --coverage
```

### Linting and Formatting

```bash
# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format
```

### Type Checking

```bash
pnpm typecheck
```

---

## Project Structure

```
moviebox-js-sdk/
├── src/                    # Source code
│   ├── index.ts           # Main exports
│   ├── session.ts         # Session management
│   ├── search.ts          # Search functionality
│   ├── details.ts         # Movie details
│   ├── series.ts          # Series/episode details
│   ├── stream.ts          # Streaming URLs
│   ├── download.ts        # Download functionality
│   ├── errors.ts          # Error classes
│   ├── types.ts           # TypeScript types
│   ├── logger.ts          # Logging utilities
│   ├── constants.ts       # Constants
│   └── __fixtures__/      # Test fixtures
├── docs/                   # Documentation
│   ├── api-reference.md   # API documentation
│   ├── types.md          # Type reference
│   ├── errors.md         # Error handling guide
│   ├── proxy.md          # Proxy configuration
│   └── guides/           # How-to guides
├── test/                   # Integration tests
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

---

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode in TypeScript
- Prefer explicit types over `any`

### ES Modules

- Use ES modules (`import`/`export`)
- Use `.js` extension in imports

### Naming Conventions

- **PascalCase** for classes, interfaces, types
- **camelCase** for variables, functions, methods
- **SCREAMING_SNAKE_CASE** for constants
- **kebab-case** for file names

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Use trailing commas
- Maximum line length: 100 characters

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

## Testing

### Writing Tests

- Use Vitest for testing
- Place tests alongside source files with `.test.ts` extension
- Use descriptive test names

```typescript
import { describe, it, expect } from 'vitest';
import { search } from './search.js';

describe('search', () => {
  it('should return search results', async () => {
    const session = new MovieboxSession();
    const result = await search(session, { query: 'test' });
    
    expect(result).toBeDefined();
    expect(result.results).toBeInstanceOf(Array);
  });
});
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test src/search.test.ts

# Run tests matching pattern
pnpm test --grep "search"

# Watch mode
pnpm test:watch
```

---

## Submitting Changes

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Changes

- Follow coding standards
- Add tests for new features
- Update documentation if needed

### 3. Commit Changes

Use conventional commit messages:

```bash
# Feature
git commit -m "feat: add search filtering by type"

# Bug fix
git commit -m "fix: handle empty search results"

# Documentation
git commit -m "docs: update API reference"

# Refactoring
git commit -m "refactor: simplify session initialization"
```

### 4. Push Changes

```bash
git push origin feature/your-feature-name
```

---

## Pull Request Guidelines

### PR Title

Use conventional commit format:
- `feat: Add new feature`
- `fix: Fix bug`
- `docs: Update documentation`
- `refactor: Code refactoring`
- `test: Add tests`
- `chore: Maintenance`

### PR Description

1. **Summary**: Briefly describe the changes
2. **Related Issues**: Reference any related issues
3. **Testing**: Describe how you tested the changes
4. **Screenshots**: If applicable, add screenshots

### PR Checklist

- [ ] Tests pass
- [ ] Code follows style guidelines
- [ ] Documentation updated (if needed)
- [ ] No linting errors
- [ ] TypeScript compiles without errors

### Review Process

1. Maintainers will review your PR
2. Address any feedback
3. Once approved, your PR will be merged

---

## Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation
- **style**: Formatting
- **refactor**: Code restructuring
- **test**: Adding/updating tests
- **chore**: Maintenance

### Example

```
feat(search): add filter by genre

Add ability to filter search results by genre.
Includes unit tests for the new functionality.

Closes #123
```

---

## Questions?

If you have questions, feel free to open an issue or start a discussion on GitHub.

---

## License

By contributing, you agree that your contributions will be licensed under the [ISC License](./LICENSE).
