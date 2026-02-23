# Security Policy

This document outlines the security policy for the MovieBox JS SDK.

---

## Table of Contents

- [Supported Versions](#supported-versions)
- [Reporting a Vulnerability](#reporting-a-vulnerability)
- [Security Best Practices](#security-best-practices)
- [Dependencies](#dependencies)
- [Security Updates](#security-updates)

---

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:               |

We recommend always using the latest version of the SDK to ensure you have the latest security patches.

---

## Reporting a Vulnerability

If you discover a security vulnerability within this SDK, please send an email to the maintainer or open a GitHub issue with the label `security`.

### What to Include

When reporting a vulnerability, please include:

1. **Description**: A clear description of the vulnerability
2. **Steps to Reproduce**: Detailed steps to reproduce the issue
3. **Impact**: Potential impact of the vulnerability
4. **Suggested Fix**: If you have a suggestion for fixing the issue

### Response Timeline

- **Initial Response**: Within 48 hours
- **Severity Assessment**: Within 7 days
- **Fix Timeline**: Depending on severity (critical issues will be addressed immediately)

### Bug Bounty

(To be determined)

---

## Security Best Practices

### 1. Use Environment Variables for Sensitive Data

```typescript
// ❌ Don't hardcode sensitive data
const session = new MovieboxSession({
  proxyUrl: 'http://admin:password@proxy.com'
});

// ✅ Use environment variables
const session = new MovieboxSession({
  proxyUrl: process.env.MOVIEBOX_PROXY
});
```

### 2. Validate User Input

```typescript
// ❌ Don't use unsanitized user input
const detailPath = userInput; // Could be malicious

// ✅ Validate and sanitize input
const detailPath = sanitizePath(userInput);
if (!isValidPath(detailPath)) {
  throw new Error('Invalid path');
}
```

### 3. Handle Errors Properly

```typescript
// ❌ Don't expose internal details
catch (error) {
  res.status(500).send(error.stack); // Exposes internals
}

// ✅ Return safe error messages
catch (error) {
  logger.error(error); // Log internally
  res.status(500).send('An error occurred'); // Safe message
}
```

### 4. Use HTTPS

Always use HTTPS for production connections:

```typescript
const session = new MovieboxSession({
  protocol: 'https' // Default
});
```

### 5. Proxy Authentication

When using proxies with authentication:

```typescript
// Encode credentials properly
const proxyUrl = `http://${encodeURIComponent(username)}:${encodeURIComponent(password)}@proxy.com`;

const session = new MovieboxSession({
  proxyUrl
});
```

---

## Dependencies

The SDK depends on the following packages:

| Package | Purpose | Security |
|---------|---------|----------|
| `pino` | Logging | Reviewed |
| `undici` | HTTP client | Reviewed |

### Vulnerability Scanning

We regularly scan dependencies for vulnerabilities using:
- GitHub Dependabot
- npm audit

---

## Security Updates

### Release Process

1. Security issues are fixed as quickly as possible
2. We follow responsible disclosure practices
3. Security releases are prioritized and may bypass normal release cycles

### Notification

Security updates are announced via:
- GitHub Security Advisories
- Release notes

### Updating

To update to the latest version:

```bash
pnpm update moviebox-js-sdk
```

---

## Contact

For security-related issues, please do NOT open a public issue. Instead:

1. Email the maintainer directly
2. Or use GitHub's private vulnerability reporting

---

## Credits

Thank you to the following for helping improve the security of this project:

- (To be updated as contributors are acknowledged)

---

## Related Documents

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Contributing](./CONTRIBUTING.md)
- [License](./LICENSE)
