# Contributing to ComfyUI Provider

Thank you for your interest in contributing to the ComfyUI Provider! This document provides guidelines and information for contributors.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/[YOUR_GITHUB_USERNAME]/comfyui-provider.git
   cd comfyui-provider
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run tests**
   ```bash
   npm test
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

## Development Workflow

### Code Style
- Use TypeScript for all new code
- Follow existing code patterns and conventions
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Testing
- Write tests for all new features
- Maintain high test coverage (>80%)
- Use descriptive test names
- Test both success and error cases

### Commits
- Use conventional commits format
- Keep commits focused and atomic
- Write clear commit messages

## Pull Request Process

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** and ensure tests pass
4. **Update documentation** if needed
5. **Commit your changes** with conventional commit format
6. **Push to your fork** and create a Pull Request

## Testing Locally

### Prerequisites
- Node.js 18+ and npm
- ComfyUI running locally (optional, for integration testing)

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/provider.test.ts
```

## Code Quality

### TypeScript
- Enable strict mode
- Use proper type annotations
- Avoid `any` types when possible
- Use interfaces for object shapes

### Error Handling
- Provide meaningful error messages
- Use appropriate error types
- Handle edge cases gracefully
- Don't expose sensitive information in errors

### Performance
- Minimize bundle size impact
- Avoid unnecessary dependencies
- Use efficient algorithms
- Consider memory usage for large operations

## Documentation

- Update README.md for new features
- Add JSDoc comments for public APIs
- Update examples as needed
- Keep documentation current

## Questions?

If you have questions about contributing, please:
1. Check existing issues and documentation
2. Create an issue for discussion
3. Reach out to maintainers

Thank you for contributing! 🎉
