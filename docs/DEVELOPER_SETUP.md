# BitSave Developer Setup Guide

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git
- Code editor (VS Code recommended)
- Stacks wallet (for testnet testing)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd Bitsave-Stacks

# Install dependencies
npm install

# Install Clarinet globally
npm install -g @hirosystems/clarinet

# Verify installation
clarinet --version
```

### Initial Setup
```bash
# Check project structure
clarinet check

# Run tests to verify setup
npm test

# Start local development environment
clarinet console
```

## Development Environment

### Project Structure
```
Bitsave-Stacks/
├── contracts/              # Smart contracts
│   ├── bitsave.clar        # Main savings contract
│   ├── bitsave-badges.clar # NFT badge system
│   ├── bitsave-referrals.clar # Referral system
│   └── bitsave-upgrade.clar   # Upgrade management
├── tests/                  # Test suites
│   ├── bitsave_test.ts     # Core functionality tests
│   ├── bitsave-badges_test.ts # Badge system tests
│   └── ...                 # Additional test files
├── docs/                   # Documentation
├── frontend/               # Frontend application
├── Clarinet.toml          # Clarinet configuration
├── package.json           # Node.js dependencies
└── README.md              # Project overview
```

### Configuration Files

#### Clarinet.toml
```toml
[project]
name = "bitsave"
description = "Bitcoin-powered STX savings vault"
authors = ["Marcus David"]
telemetry = false
cache_dir = "./.cache"
requirements = []

[contracts.bitsave]
path = "contracts/bitsave.clar"
clarity_version = 2
epoch = "2.4"

[contracts.bitsave-badges]
path = "contracts/bitsave-badges.clar"
clarity_version = 2
epoch = "2.4"

[contracts.bitsave-referrals]
path = "contracts/bitsave-referrals.clar"
clarity_version = 2
epoch = "2.4"

[contracts.bitsave-upgrade]
path = "contracts/bitsave-upgrade.clar"
clarity_version = 2
epoch = "2.4"
```

#### package.json Scripts
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:unit": "vitest run tests/*_test.ts",
    "test:integration": "vitest run tests/*integration*",
    "test:security": "vitest run tests/*security*",
    "check": "clarinet check",
    "console": "clarinet console",
    "deploy:testnet": "clarinet deployments apply --network testnet",
    "deploy:mainnet": "clarinet deployments apply --network mainnet"
  }
}
```

## Development Workflow

### 1. Contract Development

#### Writing Contracts
```clarity
;; Example function structure
(define-public (function-name (param1 uint) (param2 principal))
  (begin
    ;; Input validation
    (asserts! (> param1 u0) ERR_INVALID_INPUT)
    
    ;; Business logic
    (let ((result (some-calculation param1)))
      ;; State updates
      (map-set some-map {key: param2} {value: result})
      
      ;; Return success
      (ok result)
    )
  )
)
```

#### Best Practices
1. **Input Validation**: Always validate inputs
2. **Error Handling**: Use descriptive error codes
3. **State Management**: Minimize state changes
4. **Gas Optimization**: Avoid unnecessary computations
5. **Documentation**: Comment complex logic

#### Testing Contracts
```bash
# Check syntax
clarinet check

# Run specific test file
npx vitest tests/bitsave_test.ts

# Run all tests
npm test

# Watch mode for development
npm run test:watch
```

### 2. Test Development

#### Test Structure
```typescript
import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;

describe("Feature Tests", () => {
  beforeEach(() => {
    // Reset state before each test
  });

  it("should handle basic functionality", () => {
    // Arrange
    const amount = 5000000;
    const period = 1000;
    
    // Act
    const result = simnet.callPublicFn(
      "bitsave",
      "deposit",
      [Cl.uint(amount), Cl.uint(period)],
      alice
    );
    
    // Assert
    expect(result.result).toBeOk();
  });
});
```

#### Test Categories
1. **Unit Tests**: Individual function testing
2. **Integration Tests**: Cross-contract interactions
3. **Security Tests**: Vulnerability testing
4. **Performance Tests**: Gas and speed optimization
5. **Edge Case Tests**: Boundary conditions

### 3. Local Development

#### Clarinet Console
```bash
# Start interactive console
clarinet console

# In console - deploy contracts
::deploy_contracts

# Call functions
(contract-call? .bitsave deposit u5000000 u1000)

# Check state
(contract-call? .bitsave get-savings tx-sender)
```

#### Local Blockchain
```bash
# Start local devnet
clarinet integrate

# Deploy to local network
clarinet deployments apply --network devnet
```

## Code Quality Standards

### Clarity Code Style

#### Naming Conventions
```clarity
;; Constants: UPPER_SNAKE_CASE
(define-constant ERR_NOT_AUTHORIZED (err u105))

;; Variables: kebab-case
(define-data-var reward-rate uint u10)

;; Functions: kebab-case
(define-public (set-reward-rate (new-rate uint))
  ;; implementation
)

;; Maps: kebab-case
(define-map user-savings
  { user: principal }
  { amount: uint, unlock-height: uint }
)
```

#### Documentation Standards
```clarity
;; -----------------------------------------------------------
;; Function: deposit
;; Description: Locks STX tokens for specified period
;; Parameters:
;;   - amount: Amount in microSTX to deposit
;;   - lock-period: Number of blocks to lock funds
;; Returns: (ok {amount: uint, unlock-block: uint})
;; Errors:
;;   - ERR_NO_AMOUNT: Amount must be > 0
;;   - ERR_ALREADY_DEPOSITED: User has active deposit
;; -----------------------------------------------------------
(define-public (deposit (amount uint) (lock-period uint))
  ;; implementation
)
```

### TypeScript Code Style

#### Test Standards
```typescript
// Use descriptive test names
it("should reject deposits below minimum threshold", () => {
  // Test implementation
});

// Group related tests
describe("Deposit Validation", () => {
  describe("Amount Validation", () => {
    // Amount-related tests
  });
  
  describe("Period Validation", () => {
    // Period-related tests
  });
});

// Use proper assertions
expect(result.result).toBeOk();
expect(savingsData["amount"]).toBeUint(expectedAmount);
```

## Debugging and Testing

### Common Debugging Techniques

#### Contract Debugging
```clarity
;; Add debug prints (remove before deployment)
(print {debug: "checkpoint-1", value: some-variable})

;; Use assertions for validation
(asserts! (> amount u0) ERR_NO_AMOUNT)

;; Return detailed error information
(err {code: u100, message: "Amount must be greater than zero"})
```

#### Test Debugging
```typescript
// Log intermediate values
console.log("Deposit result:", result);
console.log("Savings data:", savingsData);

// Use detailed assertions
expect(result.result).toBeOk();
const okValue = result.result.expectOk();
expect(okValue).toEqual(expectedValue);
```

### Performance Testing
```typescript
it("should complete deposit within reasonable time", () => {
  const startTime = performance.now();
  
  const result = simnet.callPublicFn(
    "bitsave",
    "deposit",
    [Cl.uint(5000000), Cl.uint(1000)],
    alice
  );
  
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  
  expect(result.result).toBeOk();
  expect(executionTime).toBeLessThan(100); // ms
});
```

## Integration Development

### Frontend Integration

#### Contract Interaction
```typescript
import { StacksNetwork, StacksTestnet } from '@stacks/network';
import { callReadOnlyFunction, contractPrincipalCV, uintCV } from '@stacks/transactions';

// Read contract state
const network = new StacksTestnet();
const contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const contractName = 'bitsave';

const result = await callReadOnlyFunction({
  network,
  contractAddress,
  contractName,
  functionName: 'get-savings',
  functionArgs: [contractPrincipalCV(userAddress)],
  senderAddress: userAddress,
});
```

#### Error Handling
```typescript
try {
  const result = await contractCall({
    // contract call parameters
  });
  
  if (result.isOk) {
    // Handle success
  } else {
    // Handle contract error
    const errorCode = result.value;
    handleContractError(errorCode);
  }
} catch (error) {
  // Handle network/transaction error
  console.error('Transaction failed:', error);
}
```

### API Integration

#### REST API Endpoints
```typescript
// Get contract state
const response = await fetch(
  `https://stacks-node-api.testnet.stacks.co/v2/contracts/interface/${contractAddress}/${contractName}`
);

// Get transaction status
const txResponse = await fetch(
  `https://stacks-node-api.testnet.stacks.co/extended/v1/tx/${txId}`
);
```

## Deployment Preparation

### Pre-deployment Checklist
- [ ] All tests passing
- [ ] Code review completed
- [ ] Security audit performed
- [ ] Documentation updated
- [ ] Configuration verified
- [ ] Testnet deployment successful

### Testnet Deployment
```bash
# Deploy to testnet
npm run deploy:testnet

# Verify deployment
clarinet deployments check --network testnet

# Test basic functionality
clarinet console --network testnet
```

### Mainnet Preparation
```bash
# Final test run
npm test

# Security check
npm run test:security

# Deploy to mainnet (after thorough testing)
npm run deploy:mainnet
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run check
      - run: npm test
```

### Quality Gates
1. **Syntax Check**: `clarinet check` must pass
2. **Test Coverage**: Minimum 90% coverage
3. **Security Tests**: All security tests pass
4. **Performance Tests**: Meet performance benchmarks
5. **Code Review**: Peer review required

## Resources and Tools

### Development Tools
- **Clarinet**: Stacks development environment
- **VS Code**: Recommended editor
- **Clarity LSP**: Language server for Clarity
- **Stacks.js**: JavaScript SDK for Stacks

### Documentation
- [Clarity Language Reference](https://docs.stacks.co/clarity)
- [Stacks.js Documentation](https://stacks.js.org/)
- [Clarinet Documentation](https://github.com/hirosystems/clarinet)

### Community Resources
- [Stacks Discord](https://discord.gg/stacks)
- [Stacks Forum](https://forum.stacks.org/)
- [GitHub Discussions](https://github.com/stacks-network/stacks-blockchain/discussions)

## Getting Help

### Internal Resources
1. **API Documentation**: Complete function reference
2. **Troubleshooting Guide**: Common issues and solutions
3. **Code Examples**: Integration samples
4. **Test Suite**: Comprehensive test examples

### External Support
1. **Stacks Documentation**: Official guides and references
2. **Community Forums**: Developer discussions
3. **GitHub Issues**: Bug reports and feature requests
4. **Stack Overflow**: Technical questions with `stacks` tag

## Contributing Guidelines

### Code Contributions
1. Fork the repository
2. Create feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit pull request with description

### Documentation Contributions
1. Update relevant documentation
2. Include code examples
3. Test documentation accuracy
4. Submit pull request

### Bug Reports
1. Use issue template
2. Provide reproduction steps
3. Include environment details
4. Add relevant logs/screenshots

Remember: Always test thoroughly on testnet before mainnet deployment!
