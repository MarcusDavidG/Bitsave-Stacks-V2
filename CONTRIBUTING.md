# BitSave Contribution Guidelines

## Welcome Contributors!

Thank you for your interest in contributing to BitSave! This document provides guidelines for contributing to the project.

## Code of Conduct

### Our Pledge
We are committed to making participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards
- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- Clarinet CLI tool
- Basic understanding of Clarity and Stacks blockchain

### Setup
```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Bitsave-Stacks.git
cd Bitsave-Stacks

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/Bitsave-Stacks.git

# Install dependencies
npm install

# Verify setup
npm test
```

## Types of Contributions

### Bug Reports
- Use the bug report template
- Provide clear reproduction steps
- Include environment details
- Add relevant logs or screenshots

### Feature Requests
- Use the feature request template
- Explain the use case and benefits
- Consider implementation complexity
- Discuss with maintainers first for large features

### Code Contributions
- Bug fixes
- New features
- Performance improvements
- Documentation updates
- Test improvements

### Documentation
- API documentation
- User guides
- Developer tutorials
- Code comments
- README improvements

## Development Workflow

### Branch Strategy
```bash
# Create feature branch from main
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to your fork
git push origin feature/your-feature-name

# Create pull request
```

### Commit Message Format
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

#### Examples
```
feat: add time-based reward multipliers
fix: resolve early withdrawal penalty calculation
docs: update API documentation for new functions
test: add comprehensive edge case tests
```

### Code Quality Standards

#### Clarity Code Style
```clarity
;; Use descriptive function names
(define-public (calculate-compound-reward (principal uint) (periods uint))
  ;; Add comprehensive documentation
  ;; Validate all inputs
  (asserts! (> principal u0) ERR_INVALID_PRINCIPAL)
  (asserts! (> periods u0) ERR_INVALID_PERIODS)
  
  ;; Use clear variable names
  (let ((base-rate (var-get reward-rate))
        (frequency (var-get compound-frequency)))
    ;; Implementation
  )
)
```

#### TypeScript Code Style
```typescript
// Use descriptive test names
describe("Compound Interest Calculation", () => {
  it("should calculate correct rewards for 1-year deposit", () => {
    // Arrange
    const amount = 10000000; // 10 STX
    const period = 52560; // 1 year in blocks
    
    // Act
    const result = calculateReward(amount, period);
    
    // Assert
    expect(result).toBeGreaterThan(amount);
  });
});
```

### Testing Requirements

#### Test Coverage
- Minimum 90% code coverage
- All new functions must have tests
- Edge cases must be covered
- Integration tests for cross-contract interactions

#### Test Categories
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Security tests
npm run test:security

# Performance tests
npm run test:performance
```

## Pull Request Process

### Before Submitting
- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] Branch is up to date with main

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added for new functionality
```

### Review Process
1. **Automated Checks**: CI/CD pipeline runs tests
2. **Code Review**: Maintainer reviews code quality
3. **Testing**: Reviewer tests functionality
4. **Approval**: Maintainer approves changes
5. **Merge**: Changes merged to main branch

## Issue Guidelines

### Bug Reports
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Environment**
- OS: [e.g. macOS, Ubuntu]
- Node version: [e.g. 18.0.0]
- Clarinet version: [e.g. 1.5.0]

**Additional context**
Any other context about the problem.
```

### Feature Requests
```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features you've considered.

**Additional context**
Any other context or screenshots about the feature request.
```

## Security Contributions

### Reporting Security Issues
- **DO NOT** create public issues for security vulnerabilities
- Email security issues to: security@bitsave.example.com
- Include detailed reproduction steps
- Allow time for fix before public disclosure

### Security Review Process
1. **Assessment**: Evaluate severity and impact
2. **Fix Development**: Develop and test fix
3. **Disclosure**: Coordinate responsible disclosure
4. **Recognition**: Credit security researchers

## Documentation Contributions

### Documentation Standards
- Use clear, concise language
- Include code examples
- Test all examples
- Update table of contents
- Follow markdown style guide

### Areas Needing Documentation
- API reference updates
- User guides and tutorials
- Developer onboarding
- Security best practices
- Troubleshooting guides

## Community Guidelines

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Discord**: Real-time community chat
- **Email**: Security issues and private matters

### Getting Help
- Check existing documentation first
- Search existing issues and discussions
- Ask questions in appropriate channels
- Be patient and respectful

### Helping Others
- Answer questions when you can
- Review pull requests
- Test new features
- Improve documentation
- Share knowledge and experience

## Recognition

### Contributors
All contributors are recognized in:
- README.md contributors section
- Release notes
- Project documentation
- Community highlights

### Types of Recognition
- **Code Contributors**: Direct code contributions
- **Documentation Contributors**: Documentation improvements
- **Community Contributors**: Helping others, testing, feedback
- **Security Contributors**: Responsible security disclosures

## Release Process

### Version Numbering
We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Cycle
- **Patch releases**: As needed for critical fixes
- **Minor releases**: Monthly for new features
- **Major releases**: Quarterly for significant changes

### Release Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Security review completed
- [ ] Testnet deployment successful
- [ ] Community notification prepared

## Legal

### Licensing
- All contributions are licensed under the project license
- Contributors retain copyright to their contributions
- By contributing, you agree to license terms

### Contributor License Agreement
- Small contributions: No CLA required
- Significant contributions: May require CLA
- Corporate contributions: CLA required

## Resources

### Development Resources
- [Clarity Language Reference](https://docs.stacks.co/clarity)
- [Stacks.js Documentation](https://stacks.js.org/)
- [Clarinet Documentation](https://github.com/hirosystems/clarinet)

### Project Resources
- [API Documentation](./docs/API.md)
- [Developer Setup Guide](./docs/DEVELOPER_SETUP.md)
- [Security Guidelines](./docs/SECURITY.md)
- [Troubleshooting Guide](./docs/TROUBLESHOOTING.md)

### Community Resources
- [Project Discord](https://discord.gg/bitsave)
- [Stacks Community](https://discord.gg/stacks)
- [GitHub Discussions](https://github.com/owner/repo/discussions)

## Questions?

If you have questions about contributing, please:
1. Check the documentation
2. Search existing issues
3. Ask in GitHub Discussions
4. Join our Discord community

Thank you for contributing to BitSave! 🚀
