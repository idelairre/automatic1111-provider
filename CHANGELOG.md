# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial ComfyUI provider implementation
- Support for ComfyUI workflow-based image generation
- Comprehensive test suite with 87%+ coverage
- TypeScript support with strict typing
- AbortSignal support for request cancellation
- Custom header support with AI SDK header merging
- Model validation and checkpoint discovery
- Provider configuration options (negative prompt, steps, cfg scale, etc.)
- Integration with Vercel AI SDK v2

### Changed

- Forked from Automatic1111 provider to create ComfyUI-specific implementation
- Updated package metadata and repository information

### Technical Details

- **Framework**: Vitest for testing (87% coverage)
- **Type Safety**: Full TypeScript with strict mode
- **API Compatibility**: Vercel AI SDK v2 ImageModelV2 interface
- **Build System**: TypeScript compiler with ES modules
- **Node.js Support**: >= 18.0.0

## [0.1.0] - 2025-10-29

### Added

- Basic ComfyUI provider structure
- Workflow generation for image creation
- Model checkpoint resolution
- Error handling and logging
- Initial test coverage

### Changed

- Migrated from Automatic1111 to ComfyUI architecture
- Updated build system and dependencies

---

## Release Process

This project follows [Semantic Versioning](https://semver.org/).

### Types of Changes

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** in case of vulnerabilities

### Release Checklist

- [ ] All tests pass
- [ ] Code coverage >= 80%
- [ ] TypeScript compilation succeeds
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped in package.json
- [ ] Tagged release created
- [ ] NPM package published
