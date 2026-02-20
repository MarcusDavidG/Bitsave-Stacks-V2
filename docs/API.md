# BitSave API Reference

## Contract Functions

### bitsave.clar

#### Public Functions

##### `deposit(lock-period: uint)`
Deposits STX tokens and locks them for the specified period.

**Parameters:**
- `lock-period`: Number of blocks to lock funds (144-1051200)

**Returns:** `(response bool uint)`

**Example:**
```clarity
(contract-call? .bitsave deposit u1440) ;; Lock for ~10 days
```

##### `withdraw()`
Withdraws matured savings plus earned rewards.

**Returns:** `(response {principal: uint, rewards: uint, reputation: uint} uint)`

**Example:**
```clarity
(contract-call? .bitsave withdraw)
```

#### Read-Only Functions

##### `get-savings(user: principal)`
Returns user's current savings information.

**Parameters:**
- `user`: Principal address to query

**Returns:** `(optional {amount: uint, lock-until: uint, deposited-at: uint})`

##### `get-reputation(user: principal)`
Returns user's reputation score.

**Parameters:**
- `user`: Principal address to query

**Returns:** `uint`

### bitsave-badges.clar

#### Public Functions

##### `transfer(token-id: uint, sender: principal, recipient: principal)`
Transfers badge ownership between users.

**Parameters:**
- `token-id`: Badge ID to transfer
- `sender`: Current owner
- `recipient`: New owner

**Returns:** `(response bool uint)`
