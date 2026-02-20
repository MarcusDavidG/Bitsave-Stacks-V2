import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;
const charlie = accounts.get("wallet_3")!;

describe("BitSave Property-Based Tests", () => {
  beforeEach(() => {
    // Reset simnet state before each test
  });

  describe("Deposit Amount Properties", () => {
    it("should maintain deposit amount invariant", () => {
      const amounts = [1000000, 5000000, 10000000, 50000000]; // 1, 5, 10, 50 STX
      
      amounts.forEach(amount => {
        const depositResult = simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(amount), Cl.uint(144)],
          alice
        );
        
        expect(depositResult.result).toBeOk();
        
        const savingsResult = simnet.callReadOnlyFn(
          "bitsave",
          "get-savings",
          [Cl.principal(alice)],
          deployer
        );
        
        const savings = savingsResult.result.expectOk().expectSome().expectTuple();
        expect(savings["amount"]).toBeUint(amount);
        
        // Reset for next test
        simnet.mineEmptyBlocks(200);
        simnet.callPublicFn("bitsave", "withdraw", [], alice);
      });
    });

    it("should reject deposits below minimum for any user", () => {
      const users = [alice, bob, charlie];
      const belowMinimum = 500000; // 0.5 STX
      
      users.forEach(user => {
        const depositResult = simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(belowMinimum), Cl.uint(144)],
          user
        );
        expect(depositResult.result).toBeErr(Cl.uint(107)); // ERR_BELOW_MINIMUM
      });
    });

    it("should reject deposits above maximum for any user", () => {
      const users = [alice, bob, charlie];
      const aboveMaximum = 200000000000000; // 200,000 STX
      
      users.forEach(user => {
        const depositResult = simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(aboveMaximum), Cl.uint(144)],
          user
        );
        expect(depositResult.result).toBeErr(Cl.uint(108)); // ERR_EXCEEDS_MAXIMUM
      });
    });
  });

  describe("Lock Period Properties", () => {
    it("should handle various lock periods correctly", () => {
      const lockPeriods = [144, 1000, 4320, 25920, 52560]; // 1 day to 1 year
      
      lockPeriods.forEach((period, index) => {
        const user = index % 2 === 0 ? alice : bob;
        const amount = 10000000; // 10 STX
        
        const depositResult = simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(amount), Cl.uint(period)],
          user
        );
        
        expect(depositResult.result).toBeOk();
        
        const savingsResult = simnet.callReadOnlyFn(
          "bitsave",
          "get-savings",
          [Cl.principal(user)],
          deployer
        );
        
        const savings = savingsResult.result.expectOk().expectSome().expectTuple();
        const expectedUnlock = simnet.blockHeight + period;
        expect(savings["unlock-height"]).toBeUint(expectedUnlock);
        
        // Clean up
        simnet.mineEmptyBlocks(period + 10);
        simnet.callPublicFn("bitsave", "withdraw", [], user);
      });
    });
  });

  describe("Reward Calculation Properties", () => {
    it("should calculate rewards proportionally to amount", () => {
      const baseAmount = 1000000; // 1 STX
      const multipliers = [1, 5, 10, 50];
      const lockPeriod = 4320; // ~1 month
      
      const rewards: number[] = [];
      
      multipliers.forEach((multiplier, index) => {
        const amount = baseAmount * multiplier;
        const user = [alice, bob, charlie, deployer][index];
        
        // Deposit
        simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(amount), Cl.uint(lockPeriod)],
          user
        );
        
        // Wait for maturity
        simnet.mineEmptyBlocks(lockPeriod + 10);
        
        // Withdraw and check reward
        const withdrawResult = simnet.callPublicFn(
          "bitsave",
          "withdraw",
          [],
          user
        );
        
        const withdrawData = withdrawResult.result.expectOk().expectTuple();
        const earnedPoints = withdrawData["earned-points"].expectInt();
        rewards.push(earnedPoints);
      });
      
      // Verify proportional rewards (allowing for rounding)
      for (let i = 1; i < rewards.length; i++) {
        const expectedRatio = multipliers[i] / multipliers[0];
        const actualRatio = rewards[i] / rewards[0];
        expect(Math.abs(actualRatio - expectedRatio)).toBeLessThan(0.1);
      }
    });
  });

  describe("State Consistency Properties", () => {
    it("should maintain consistent state across multiple operations", () => {
      const operations = [
        { user: alice, amount: 5000000, period: 1000 },
        { user: bob, amount: 10000000, period: 2000 },
        { user: charlie, amount: 15000000, period: 3000 }
      ];
      
      // Perform all deposits
      operations.forEach(op => {
        const result = simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(op.amount), Cl.uint(op.period)],
          op.user
        );
        expect(result.result).toBeOk();
      });
      
      // Verify all savings exist
      operations.forEach(op => {
        const savingsResult = simnet.callReadOnlyFn(
          "bitsave",
          "get-savings",
          [Cl.principal(op.user)],
          deployer
        );
        
        const savings = savingsResult.result.expectOk().expectSome().expectTuple();
        expect(savings["amount"]).toBeUint(op.amount);
        expect(savings["claimed"]).toBeBool(false);
      });
      
      // Wait for all to mature
      simnet.mineEmptyBlocks(3500);
      
      // Withdraw all
      operations.forEach(op => {
        const withdrawResult = simnet.callPublicFn(
          "bitsave",
          "withdraw",
          [],
          op.user
        );
        expect(withdrawResult.result).toBeOk();
      });
      
      // Verify all are claimed
      operations.forEach(op => {
        const savingsResult = simnet.callReadOnlyFn(
          "bitsave",
          "get-savings",
          [Cl.principal(op.user)],
          deployer
        );
        
        const savings = savingsResult.result.expectOk().expectSome().expectTuple();
        expect(savings["claimed"]).toBeBool(true);
      });
    });
  });

  describe("Edge Case Properties", () => {
    it("should handle minimum lock period", () => {
      const minLockPeriod = 1; // 1 block
      
      const depositResult = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(1000000), Cl.uint(minLockPeriod)],
        alice
      );
      
      expect(depositResult.result).toBeOk();
      
      // Should be able to withdraw after 1 block
      simnet.mineEmptyBlocks(2);
      
      const withdrawResult = simnet.callPublicFn(
        "bitsave",
        "withdraw",
        [],
        alice
      );
      
      expect(withdrawResult.result).toBeOk();
    });

    it("should handle maximum reasonable amounts", () => {
      const maxAmount = 99999999999999; // Just under 100k STX limit
      
      const depositResult = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(maxAmount), Cl.uint(144)],
        alice
      );
      
      expect(depositResult.result).toBeOk();
      
      const savingsResult = simnet.callReadOnlyFn(
        "bitsave",
        "get-savings",
        [Cl.principal(alice)],
        deployer
      );
      
      const savings = savingsResult.result.expectOk().expectSome().expectTuple();
      expect(savings["amount"]).toBeUint(maxAmount);
    });
  });

  describe("Streak Properties", () => {
    it("should maintain streak consistency", () => {
      // First deposit
      simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(1000000), Cl.uint(100)],
        alice
      );
      
      simnet.mineEmptyBlocks(150);
      simnet.callPublicFn("bitsave", "withdraw", [], alice);
      
      // Check streak after first deposit
      let repResult = simnet.callReadOnlyFn(
        "bitsave",
        "get-reputation",
        [Cl.principal(alice)],
        deployer
      );
      
      let rep = repResult.result.expectOk().expectTuple();
      expect(rep["current-streak"]).toBeUint(1);
      expect(rep["longest-streak"]).toBeUint(1);
      
      // Second deposit within streak window
      simnet.mineEmptyBlocks(1000); // Still within 30-day window
      
      simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(2000000), Cl.uint(100)],
        alice
      );
      
      simnet.mineEmptyBlocks(150);
      simnet.callPublicFn("bitsave", "withdraw", [], alice);
      
      // Check streak increased
      repResult = simnet.callReadOnlyFn(
        "bitsave",
        "get-reputation",
        [Cl.principal(alice)],
        deployer
      );
      
      rep = repResult.result.expectOk().expectTuple();
      expect(rep["current-streak"]).toBeUint(2);
      expect(rep["longest-streak"]).toBeUint(2);
    });
  });
});
