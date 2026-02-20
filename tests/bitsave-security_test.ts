import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;
const attacker = accounts.get("wallet_3")!;

describe("BitSave Security Vulnerability Tests", () => {
  beforeEach(() => {
    // Reset simnet state before each test
  });

  describe("Authorization Tests", () => {
    it("should prevent non-admin from pausing contract", () => {
      const result = simnet.callPublicFn(
        "bitsave",
        "pause-contract",
        [],
        attacker
      );
      
      expect(result.result).toBeErr(Cl.uint(105)); // ERR_NOT_AUTHORIZED
    });

    it("should prevent non-admin from changing reward rate", () => {
      const result = simnet.callPublicFn(
        "bitsave",
        "set-reward-rate",
        [Cl.uint(50)],
        attacker
      );
      
      expect(result.result).toBeErr(Cl.uint(105)); // ERR_NOT_AUTHORIZED
    });

    it("should prevent non-admin from changing minimum deposit", () => {
      const result = simnet.callPublicFn(
        "bitsave",
        "set-minimum-deposit",
        [Cl.uint(2000000)],
        attacker
      );
      
      expect(result.result).toBeErr(Cl.uint(105)); // ERR_NOT_AUTHORIZED
    });

    it("should prevent non-admin from setting withdrawal penalty", () => {
      const result = simnet.callPublicFn(
        "bitsave",
        "set-early-withdrawal-penalty",
        [Cl.uint(50)],
        attacker
      );
      
      expect(result.result).toBeErr(Cl.uint(105)); // ERR_NOT_AUTHORIZED
    });

    it("should prevent non-admin from setting compound frequency", () => {
      const result = simnet.callPublicFn(
        "bitsave",
        "set-compound-frequency",
        [Cl.uint(6)],
        attacker
      );
      
      expect(result.result).toBeErr(Cl.uint(105)); // ERR_NOT_AUTHORIZED
    });
  });

  describe("Double Spending Prevention", () => {
    it("should prevent double deposits from same user", () => {
      // First deposit should succeed
      const firstDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(5000000), Cl.uint(1000)],
        alice
      );
      
      expect(firstDeposit.result).toBeOk();
      
      // Second deposit should fail
      const secondDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(3000000), Cl.uint(500)],
        alice
      );
      
      expect(secondDeposit.result).toBeErr(Cl.uint(101)); // ERR_ALREADY_DEPOSITED
    });

    it("should prevent double withdrawals", () => {
      // Setup deposit
      simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(5000000), Cl.uint(100)],
        alice
      );
      
      simnet.mineEmptyBlocks(150);
      
      // First withdrawal should succeed
      const firstWithdraw = simnet.callPublicFn(
        "bitsave",
        "withdraw",
        [],
        alice
      );
      
      expect(firstWithdraw.result).toBeOk();
      
      // Second withdrawal should fail
      const secondWithdraw = simnet.callPublicFn(
        "bitsave",
        "withdraw",
        [],
        alice
      );
      
      expect(secondWithdraw.result).toBeErr(Cl.uint(102)); // ERR_ALREADY_WITHDRAWN
    });
  });

  describe("Reentrancy Attack Prevention", () => {
    it("should handle rapid successive operations safely", () => {
      // Attempt rapid deposit-withdraw cycles
      for (let i = 0; i < 5; i++) {
        const depositResult = simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(1000000), Cl.uint(1)],
          alice
        );
        
        expect(depositResult.result).toBeOk();
        
        simnet.mineEmptyBlocks(2);
        
        const withdrawResult = simnet.callPublicFn(
          "bitsave",
          "withdraw",
          [],
          alice
        );
        
        expect(withdrawResult.result).toBeOk();
        
        // Should respect cooldown
        simnet.mineEmptyBlocks(150);
      }
    });

    it("should prevent withdrawal during cooldown period", () => {
      // First cycle
      simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(2000000), Cl.uint(10)],
        alice
      );
      
      simnet.mineEmptyBlocks(15);
      simnet.callPublicFn("bitsave", "withdraw", [], alice);
      
      // Try immediate second cycle
      simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(2000000), Cl.uint(10)],
        alice
      );
      
      simnet.mineEmptyBlocks(15);
      
      // Should fail due to cooldown
      const withdrawResult = simnet.callPublicFn(
        "bitsave",
        "withdraw",
        [],
        alice
      );
      
      expect(withdrawResult.result).toBeErr(Cl.uint(109)); // ERR_WITHDRAWAL_COOLDOWN
    });
  });

  describe("Input Validation Attacks", () => {
    it("should reject malicious deposit amounts", () => {
      const maliciousAmounts = [
        0, // Zero amount
        999999, // Below minimum
        200000000000000, // Above maximum
      ];
      
      maliciousAmounts.forEach(amount => {
        const result = simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(amount), Cl.uint(144)],
          attacker
        );
        
        expect(result.result).toBeErr();
      });
    });

    it("should handle extreme lock periods safely", () => {
      const extremePeriods = [
        0, // Zero period (should work but allow immediate withdrawal)
        4294967295, // Maximum uint32
      ];
      
      extremePeriods.forEach(period => {
        const result = simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(5000000), Cl.uint(period)],
          alice
        );
        
        // Should either succeed or fail gracefully
        if (result.result.isOk) {
          // If it succeeds, withdrawal should work
          const withdrawResult = simnet.callPublicFn(
            "bitsave",
            "withdraw",
            [],
            alice
          );
          expect(withdrawResult.result).toBeOk();
          simnet.mineEmptyBlocks(150); // Cooldown
        }
      });
    });

    it("should validate admin parameter bounds", () => {
      // Test penalty rate bounds
      const invalidPenalties = [101, 200, 1000]; // Above 100%
      
      invalidPenalties.forEach(penalty => {
        const result = simnet.callPublicFn(
          "bitsave",
          "set-early-withdrawal-penalty",
          [Cl.uint(penalty)],
          deployer
        );
        
        expect(result.result).toBeErr(Cl.uint(100)); // ERR_NO_AMOUNT (used for validation)
      });
      
      // Test compound frequency bounds
      const invalidFrequencies = [0]; // Zero frequency
      
      invalidFrequencies.forEach(frequency => {
        const result = simnet.callPublicFn(
          "bitsave",
          "set-compound-frequency",
          [Cl.uint(frequency)],
          deployer
        );
        
        expect(result.result).toBeErr(Cl.uint(100)); // ERR_NO_AMOUNT
      });
    });
  });

  describe("State Manipulation Attacks", () => {
    it("should prevent unauthorized state changes", () => {
      // Setup legitimate state
      simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(10000000), Cl.uint(1000)],
        alice
      );
      
      // Attacker cannot modify alice's savings directly
      // (This would require direct map manipulation which isn't possible through public functions)
      
      // Verify alice's state is intact
      const savingsResult = simnet.callReadOnlyFn(
        "bitsave",
        "get-savings",
        [Cl.principal(alice)],
        deployer
      );
      
      const savings = savingsResult.result.expectOk().expectSome().expectTuple();
      expect(savings["amount"]).toBeUint(10000000);
      expect(savings["claimed"]).toBeBool(false);
    });

    it("should prevent cross-user interference", () => {
      // Setup multiple users
      const users = [alice, bob, attacker];
      const amounts = [5000000, 7000000, 3000000];
      
      users.forEach((user, index) => {
        simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(amounts[index]), Cl.uint(500)],
          user
        );
      });
      
      // Each user should only be able to withdraw their own funds
      simnet.mineEmptyBlocks(600);
      
      users.forEach((user, index) => {
        const withdrawResult = simnet.callPublicFn(
          "bitsave",
          "withdraw",
          [],
          user
        );
        
        expect(withdrawResult.result).toBeOk();
        
        const withdrawData = withdrawResult.result.expectOk().expectTuple();
        expect(withdrawData["withdrawn"]).toBeUint(amounts[index]);
      });
    });
  });

  describe("Economic Attack Vectors", () => {
    it("should handle reward calculation manipulation attempts", () => {
      // Attacker tries to manipulate rewards through timing
      const attackerDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(1000000), Cl.uint(52560)], // 1 year lock
        attacker
      );
      
      expect(attackerDeposit.result).toBeOk();
      
      // Admin changes rate (legitimate operation)
      simnet.callPublicFn(
        "bitsave",
        "set-reward-rate",
        [Cl.uint(50)], // Higher rate
        deployer
      );
      
      // Attacker withdraws early to try to game the system
      const earlyWithdraw = simnet.callPublicFn(
        "bitsave",
        "withdraw",
        [],
        attacker
      );
      
      expect(earlyWithdraw.result).toBeOk();
      
      const withdrawData = earlyWithdraw.result.expectOk().expectTuple();
      expect(withdrawData["early-withdrawal"]).toBeBool(true);
      expect(withdrawData["earned-points"]).toBeInt(0); // No points for early withdrawal
      
      // Reset rate
      simnet.callPublicFn("bitsave", "set-reward-rate", [Cl.uint(10)], deployer);
    });

    it("should prevent penalty avoidance attempts", () => {
      // Set high penalty
      simnet.callPublicFn(
        "bitsave",
        "set-early-withdrawal-penalty",
        [Cl.uint(50)], // 50% penalty
        deployer
      );
      
      const attackerDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(10000000), Cl.uint(10000)], // Long lock
        attacker
      );
      
      expect(attackerDeposit.result).toBeOk();
      
      // Try to withdraw early
      const earlyWithdraw = simnet.callPublicFn(
        "bitsave",
        "withdraw",
        [],
        attacker
      );
      
      expect(earlyWithdraw.result).toBeOk();
      
      const withdrawData = earlyWithdraw.result.expectOk().expectTuple();
      expect(withdrawData["penalty"]).toBeUint(5000000); // 50% penalty applied
      expect(withdrawData["withdrawn"]).toBeUint(5000000); // Only 50% received
      
      // Reset penalty
      simnet.callPublicFn("bitsave", "set-early-withdrawal-penalty", [Cl.uint(20)], deployer);
    });

    it("should handle streak manipulation attempts", () => {
      // Attacker tries to build artificial streaks
      for (let i = 0; i < 3; i++) {
        const depositResult = simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(1000000), Cl.uint(100)],
          attacker
        );
        
        expect(depositResult.result).toBeOk();
        
        simnet.mineEmptyBlocks(150);
        
        const withdrawResult = simnet.callPublicFn(
          "bitsave",
          "withdraw",
          [],
          attacker
        );
        
        expect(withdrawResult.result).toBeOk();
        
        // Wait minimal time to try to maintain streak
        simnet.mineEmptyBlocks(200);
      }
      
      // Check that streak logic works correctly
      const reputationResult = simnet.callReadOnlyFn(
        "bitsave",
        "get-reputation",
        [Cl.principal(attacker)],
        deployer
      );
      
      const repData = reputationResult.result.expectOk().expectTuple();
      // Streak should be reasonable, not artificially inflated
      expect(repData["current-streak"]).toBeUint();
    });
  });

  describe("Contract State Attacks", () => {
    it("should handle pause state manipulation attempts", () => {
      // Only admin can pause
      const pauseResult = simnet.callPublicFn(
        "bitsave",
        "pause-contract",
        [],
        deployer
      );
      
      expect(pauseResult.result).toBeOk();
      
      // Attacker cannot unpause
      const unpauseAttempt = simnet.callPublicFn(
        "bitsave",
        "unpause-contract",
        [],
        attacker
      );
      
      expect(unpauseAttempt.result).toBeErr(Cl.uint(105)); // ERR_NOT_AUTHORIZED
      
      // Deposits should fail while paused
      const depositAttempt = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(5000000), Cl.uint(144)],
        alice
      );
      
      expect(depositAttempt.result).toBeErr(Cl.uint(106)); // ERR_CONTRACT_PAUSED
      
      // Admin can unpause
      simnet.callPublicFn("bitsave", "unpause-contract", [], deployer);
    });

    it("should prevent data corruption through edge cases", () => {
      // Test with boundary values that might cause issues
      const edgeCases = [
        { amount: 1000000, period: 1 }, // Minimum values
        { amount: 99999999999999, period: 4294967294 }, // Near maximum values
      ];
      
      edgeCases.forEach((testCase, index) => {
        const user = index === 0 ? alice : bob;
        
        const depositResult = simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(testCase.amount), Cl.uint(testCase.period)],
          user
        );
        
        if (depositResult.result.isOk) {
          // If deposit succeeds, state should be consistent
          const savingsResult = simnet.callReadOnlyFn(
            "bitsave",
            "get-savings",
            [Cl.principal(user)],
            deployer
          );
          
          const savings = savingsResult.result.expectOk().expectSome().expectTuple();
          expect(savings["amount"]).toBeUint(testCase.amount);
          
          // Withdrawal should work
          simnet.mineEmptyBlocks(Math.min(testCase.period + 10, 1000));
          
          const withdrawResult = simnet.callPublicFn(
            "bitsave",
            "withdraw",
            [],
            user
          );
          
          expect(withdrawResult.result).toBeOk();
          
          simnet.mineEmptyBlocks(150); // Cooldown
        }
      });
    });
  });

  describe("Information Disclosure Prevention", () => {
    it("should not leak sensitive information through error messages", () => {
      // Test various error conditions
      const errorTests = [
        () => simnet.callPublicFn("bitsave", "deposit", [Cl.uint(0), Cl.uint(144)], alice),
        () => simnet.callPublicFn("bitsave", "withdraw", [], alice), // No deposit
        () => simnet.callPublicFn("bitsave", "set-reward-rate", [Cl.uint(20)], alice), // Not admin
      ];
      
      errorTests.forEach(test => {
        const result = test();
        expect(result.result).toBeErr();
        // Error codes should be generic, not revealing internal state
      });
    });

    it("should protect user privacy in batch operations", () => {
      // Setup users with different amounts
      simnet.callPublicFn("bitsave", "deposit", [Cl.uint(1000000), Cl.uint(144)], alice);
      simnet.callPublicFn("bitsave", "deposit", [Cl.uint(5000000), Cl.uint(288)], bob);
      
      // Batch operation should only return requested data
      const batchResult = simnet.callReadOnlyFn(
        "bitsave",
        "batch-get-savings",
        [Cl.list([Cl.principal(alice), Cl.principal(bob)])],
        attacker
      );
      
      expect(batchResult.result).toBeOk();
      
      // Data should be properly structured and not leak extra information
      const batchData = batchResult.result.expectOk().expectList();
      expect(batchData.length).toBe(2);
    });
  });
});
