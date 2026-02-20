import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;

describe("BitSave Edge Case Tests", () => {
  beforeEach(() => {
    // Reset simnet state before each test
  });

  describe("Boundary Value Tests", () => {
    it("should handle exact minimum deposit", () => {
      const minDeposit = 1000000; // Exactly 1 STX
      
      const result = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(minDeposit), Cl.uint(144)],
        alice
      );
      
      expect(result.result).toBeOk();
    });

    it("should handle one microSTX below minimum", () => {
      const belowMin = 999999; // 1 microSTX below minimum
      
      const result = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(belowMin), Cl.uint(144)],
        alice
      );
      
      expect(result.result).toBeErr(Cl.uint(107)); // ERR_BELOW_MINIMUM
    });

    it("should handle exact maximum deposit", () => {
      const maxDeposit = 100000000000000; // Exactly 100k STX
      
      const result = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(maxDeposit), Cl.uint(144)],
        alice
      );
      
      expect(result.result).toBeOk();
    });

    it("should handle one microSTX above maximum", () => {
      const aboveMax = 100000000000001; // 1 microSTX above maximum
      
      const result = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(aboveMax), Cl.uint(144)],
        alice
      );
      
      expect(result.result).toBeErr(Cl.uint(108)); // ERR_EXCEEDS_MAXIMUM
    });
  });

  describe("Zero and Negative Value Tests", () => {
    it("should reject zero deposit amount", () => {
      const result = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(0), Cl.uint(144)],
        alice
      );
      
      expect(result.result).toBeErr(Cl.uint(100)); // ERR_NO_AMOUNT
    });

    it("should handle zero lock period", () => {
      const result = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(1000000), Cl.uint(0)],
        alice
      );
      
      // Should succeed but allow immediate withdrawal
      expect(result.result).toBeOk();
      
      const withdrawResult = simnet.callPublicFn(
        "bitsave",
        "withdraw",
        [],
        alice
      );
      
      expect(withdrawResult.result).toBeOk();
    });
  });

  describe("Overflow and Underflow Tests", () => {
    it("should handle large reward calculations without overflow", () => {
      // Set high reward rate
      simnet.callPublicFn(
        "bitsave",
        "set-reward-rate",
        [Cl.uint(100)], // 100% reward rate
        deployer
      );
      
      // Large deposit
      const largeDeposit = 50000000000000; // 50k STX
      
      simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(largeDeposit), Cl.uint(52560)], // 1 year
        alice
      );
      
      // Wait for maturity
      simnet.mineEmptyBlocks(52570);
      
      const withdrawResult = simnet.callPublicFn(
        "bitsave",
        "withdraw",
        [],
        alice
      );
      
      expect(withdrawResult.result).toBeOk();
      
      // Reset reward rate
      simnet.callPublicFn(
        "bitsave",
        "set-reward-rate",
        [Cl.uint(10)],
        deployer
      );
    });

    it("should handle maximum penalty calculation", () => {
      // Set maximum penalty
      simnet.callPublicFn(
        "bitsave",
        "set-early-withdrawal-penalty",
        [Cl.uint(100)], // 100% penalty
        deployer
      );
      
      simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(10000000), Cl.uint(1000)],
        alice
      );
      
      // Withdraw early
      const withdrawResult = simnet.callPublicFn(
        "bitsave",
        "withdraw",
        [],
        alice
      );
      
      expect(withdrawResult.result).toBeOk();
      
      const withdrawData = withdrawResult.result.expectOk().expectTuple();
      expect(withdrawData["penalty"]).toBeUint(10000000); // Full amount as penalty
      expect(withdrawData["withdrawn"]).toBeUint(0); // Nothing left
      
      // Reset penalty
      simnet.callPublicFn(
        "bitsave",
        "set-early-withdrawal-penalty",
        [Cl.uint(20)],
        deployer
      );
    });
  });

  describe("State Transition Edge Cases", () => {
    it("should handle rapid deposit-withdraw cycles", () => {
      for (let i = 0; i < 5; i++) {
        // Deposit
        const depositResult = simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(1000000), Cl.uint(1)], // 1 block lock
          alice
        );
        expect(depositResult.result).toBeOk();
        
        // Wait and withdraw
        simnet.mineEmptyBlocks(2);
        
        const withdrawResult = simnet.callPublicFn(
          "bitsave",
          "withdraw",
          [],
          alice
        );
        expect(withdrawResult.result).toBeOk();
        
        // Wait for cooldown
        simnet.mineEmptyBlocks(150); // More than default cooldown
      }
    });

    it("should handle withdrawal at exact unlock block", () => {
      const lockPeriod = 100;
      
      simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(5000000), Cl.uint(lockPeriod)],
        alice
      );
      
      // Mine exactly to unlock block
      simnet.mineEmptyBlocks(lockPeriod);
      
      const withdrawResult = simnet.callPublicFn(
        "bitsave",
        "withdraw",
        [],
        alice
      );
      
      expect(withdrawResult.result).toBeOk();
      
      const withdrawData = withdrawResult.result.expectOk().expectTuple();
      expect(withdrawData["early-withdrawal"]).toBeBool(false);
      expect(withdrawData["penalty"]).toBeUint(0);
    });

    it("should handle withdrawal one block before unlock", () => {
      const lockPeriod = 100;
      
      simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(5000000), Cl.uint(lockPeriod)],
        bob
      );
      
      // Mine one block less than lock period
      simnet.mineEmptyBlocks(lockPeriod - 1);
      
      const withdrawResult = simnet.callPublicFn(
        "bitsave",
        "withdraw",
        [],
        bob
      );
      
      expect(withdrawResult.result).toBeOk();
      
      const withdrawData = withdrawResult.result.expectOk().expectTuple();
      expect(withdrawData["early-withdrawal"]).toBeBool(true);
      expect(withdrawData["penalty"]).toBeUint(1000000); // 20% of 5 STX
    });
  });

  describe("Cooldown Edge Cases", () => {
    it("should enforce cooldown exactly", () => {
      // First deposit and withdrawal
      simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(1000000), Cl.uint(1)],
        alice
      );
      
      simnet.mineEmptyBlocks(2);
      
      simnet.callPublicFn("bitsave", "withdraw", [], alice);
      
      // Try to deposit again immediately (should work)
      const depositResult = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(1000000), Cl.uint(1)],
        alice
      );
      expect(depositResult.result).toBeOk();
      
      // Try to withdraw immediately (should fail due to cooldown)
      const withdrawResult = simnet.callPublicFn(
        "bitsave",
        "withdraw",
        [],
        alice
      );
      expect(withdrawResult.result).toBeErr(Cl.uint(109)); // ERR_WITHDRAWAL_COOLDOWN
      
      // Wait for cooldown to expire
      simnet.mineEmptyBlocks(144); // Default cooldown period
      
      // Should work now
      const withdrawResult2 = simnet.callPublicFn(
        "bitsave",
        "withdraw",
        [],
        alice
      );
      expect(withdrawResult2.result).toBeOk();
    });

    it("should handle zero cooldown period", () => {
      // Set zero cooldown
      simnet.callPublicFn(
        "bitsave",
        "set-withdrawal-cooldown",
        [Cl.uint(0)],
        deployer
      );
      
      // Multiple rapid withdrawals should work
      for (let i = 0; i < 3; i++) {
        simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(1000000), Cl.uint(1)],
          alice
        );
        
        simnet.mineEmptyBlocks(2);
        
        const withdrawResult = simnet.callPublicFn(
          "bitsave",
          "withdraw",
          [],
          alice
        );
        expect(withdrawResult.result).toBeOk();
      }
      
      // Reset cooldown
      simnet.callPublicFn(
        "bitsave",
        "set-withdrawal-cooldown",
        [Cl.uint(144)],
        deployer
      );
    });
  });

  describe("Admin Function Edge Cases", () => {
    it("should handle setting reward rate to zero", () => {
      const result = simnet.callPublicFn(
        "bitsave",
        "set-reward-rate",
        [Cl.uint(0)],
        deployer
      );
      
      expect(result.result).toBeOk(Cl.uint(0));
      
      // Test that zero rewards are calculated correctly
      simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(10000000), Cl.uint(1000)],
        alice
      );
      
      simnet.mineEmptyBlocks(1010);
      
      const withdrawResult = simnet.callPublicFn(
        "bitsave",
        "withdraw",
        [],
        alice
      );
      
      const withdrawData = withdrawResult.result.expectOk().expectTuple();
      expect(withdrawData["earned-points"]).toBeInt(0);
      
      // Reset reward rate
      simnet.callPublicFn(
        "bitsave",
        "set-reward-rate",
        [Cl.uint(10)],
        deployer
      );
    });

    it("should handle maximum reward rate", () => {
      const maxRate = 1000; // 1000% reward rate
      
      const result = simnet.callPublicFn(
        "bitsave",
        "set-reward-rate",
        [Cl.uint(maxRate)],
        deployer
      );
      
      expect(result.result).toBeOk(Cl.uint(maxRate));
      
      // Reset to reasonable rate
      simnet.callPublicFn(
        "bitsave",
        "set-reward-rate",
        [Cl.uint(10)],
        deployer
      );
    });
  });

  describe("Batch Operation Edge Cases", () => {
    it("should handle empty user list", () => {
      const result = simnet.callReadOnlyFn(
        "bitsave",
        "batch-get-savings",
        [Cl.list([])],
        deployer
      );
      
      expect(result.result).toBeOk(Cl.list([]));
    });

    it("should handle maximum user list", () => {
      const users = [alice, bob, deployer, alice, bob, deployer, alice, bob, deployer, alice];
      
      const result = simnet.callReadOnlyFn(
        "bitsave",
        "batch-get-savings",
        [Cl.list(users.map(u => Cl.principal(u)))],
        deployer
      );
      
      expect(result.result).toBeOk();
      const batchData = result.result.expectOk().expectList();
      expect(batchData.length).toBe(10);
    });
  });
});
