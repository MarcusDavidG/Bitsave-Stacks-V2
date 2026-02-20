import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;
const charlie = accounts.get("wallet_3")!;

describe("BitSave Regression Test Suite", () => {
  beforeEach(() => {
    // Reset simnet state before each test
  });

  describe("Core Functionality Regression Tests", () => {
    it("should maintain basic deposit-withdraw functionality", () => {
      // Test basic deposit
      const depositResult = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(5000000), Cl.uint(1000)],
        alice
      );
      expect(depositResult.result).toBeOk();
      
      // Verify deposit was recorded
      const savings = simnet.callReadOnlyFn(
        "bitsave",
        "get-savings",
        [Cl.principal(alice)],
        deployer
      );
      const savingsData = savings.result.expectOk().expectSome().expectTuple();
      expect(savingsData["amount"]).toBeUint(5000000);
      expect(savingsData["claimed"]).toBeBool(false);
      
      // Test withdrawal after maturity
      simnet.mineEmptyBlocks(1100);
      
      const withdrawResult = simnet.callPublicFn("bitsave", "withdraw", [], alice);
      expect(withdrawResult.result).toBeOk();
      
      const withdrawData = withdrawResult.result.expectOk().expectTuple();
      expect(withdrawData["withdrawn"]).toBeUint(5000000);
      expect(withdrawData["early-withdrawal"]).toBeBool(false);
    });

    it("should maintain reward calculation accuracy", () => {
      const testCases = [
        { amount: 1000000, period: 144, expectedMinPoints: 10 },
        { amount: 10000000, period: 4320, expectedMinPoints: 100 },
        { amount: 50000000, period: 25920, expectedMinPoints: 500 }
      ];
      
      testCases.forEach((testCase, index) => {
        const user = [alice, bob, charlie][index];
        
        const depositResult = simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(testCase.amount), Cl.uint(testCase.period)],
          user
        );
        expect(depositResult.result).toBeOk();
        
        simnet.mineEmptyBlocks(testCase.period + 10);
        
        const withdrawResult = simnet.callPublicFn("bitsave", "withdraw", [], user);
        expect(withdrawResult.result).toBeOk();
        
        const withdrawData = withdrawResult.result.expectOk().expectTuple();
        const earnedPoints = withdrawData["earned-points"].expectInt();
        
        // Points should be at least the expected minimum
        expect(earnedPoints).toBeGreaterThanOrEqual(testCase.expectedMinPoints);
        
        simnet.mineEmptyBlocks(150); // Cooldown
      });
    });

    it("should maintain penalty calculation accuracy", () => {
      const penaltyTestCases = [
        { amount: 5000000, expectedPenalty: 1000000 }, // 20% of 5 STX
        { amount: 10000000, expectedPenalty: 2000000 }, // 20% of 10 STX
        { amount: 25000000, expectedPenalty: 5000000 } // 20% of 25 STX
      ];
      
      penaltyTestCases.forEach((testCase, index) => {
        const user = [alice, bob, charlie][index];
        
        simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(testCase.amount), Cl.uint(2000)], // Long lock for early withdrawal
          user
        );
        
        // Early withdrawal
        simnet.mineEmptyBlocks(500);
        
        const withdrawResult = simnet.callPublicFn("bitsave", "withdraw", [], user);
        expect(withdrawResult.result).toBeOk();
        
        const withdrawData = withdrawResult.result.expectOk().expectTuple();
        expect(withdrawData["penalty"]).toBeUint(testCase.expectedPenalty);
        expect(withdrawData["early-withdrawal"]).toBeBool(true);
        
        simnet.mineEmptyBlocks(150); // Cooldown
      });
    });
  });

  describe("Admin Function Regression Tests", () => {
    it("should maintain admin authorization controls", () => {
      const adminFunctions = [
        { name: "pause-contract", params: [] },
        { name: "unpause-contract", params: [] },
        { name: "set-reward-rate", params: [Cl.uint(15)] },
        { name: "set-minimum-deposit", params: [Cl.uint(2000000)] },
        { name: "set-early-withdrawal-penalty", params: [Cl.uint(25)] },
        { name: "set-compound-frequency", params: [Cl.uint(6)] },
        { name: "set-withdrawal-cooldown", params: [Cl.uint(200)] }
      ];
      
      adminFunctions.forEach(func => {
        // Non-admin should fail
        const unauthorizedResult = simnet.callPublicFn(
          "bitsave",
          func.name,
          func.params,
          alice
        );
        expect(unauthorizedResult.result).toBeErr(Cl.uint(105)); // ERR_NOT_AUTHORIZED
        
        // Admin should succeed
        const authorizedResult = simnet.callPublicFn(
          "bitsave",
          func.name,
          func.params,
          deployer
        );
        expect(authorizedResult.result).toBeOk();
      });
      
      // Reset to defaults
      simnet.callPublicFn("bitsave", "set-reward-rate", [Cl.uint(10)], deployer);
      simnet.callPublicFn("bitsave", "set-minimum-deposit", [Cl.uint(1000000)], deployer);
      simnet.callPublicFn("bitsave", "set-early-withdrawal-penalty", [Cl.uint(20)], deployer);
      simnet.callPublicFn("bitsave", "set-compound-frequency", [Cl.uint(12)], deployer);
      simnet.callPublicFn("bitsave", "set-withdrawal-cooldown", [Cl.uint(144)], deployer);
    });

    it("should maintain parameter validation", () => {
      // Test invalid penalty rates
      const invalidPenalty = simnet.callPublicFn(
        "bitsave",
        "set-early-withdrawal-penalty",
        [Cl.uint(101)], // Above 100%
        deployer
      );
      expect(invalidPenalty.result).toBeErr(Cl.uint(100)); // ERR_NO_AMOUNT
      
      // Test invalid compound frequency
      const invalidFrequency = simnet.callPublicFn(
        "bitsave",
        "set-compound-frequency",
        [Cl.uint(0)], // Zero frequency
        deployer
      );
      expect(invalidFrequency.result).toBeErr(Cl.uint(100)); // ERR_NO_AMOUNT
      
      // Test invalid minimum deposit
      const invalidMinimum = simnet.callPublicFn(
        "bitsave",
        "set-minimum-deposit",
        [Cl.uint(0)], // Zero minimum
        deployer
      );
      expect(invalidMinimum.result).toBeErr(Cl.uint(100)); // ERR_NO_AMOUNT
    });
  });

  describe("State Management Regression Tests", () => {
    it("should maintain user state isolation", () => {
      // Setup different users with different states
      const users = [alice, bob, charlie];
      const amounts = [3000000, 6000000, 9000000];
      const periods = [500, 1000, 1500];
      
      users.forEach((user, index) => {
        simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(amounts[index]), Cl.uint(periods[index])],
          user
        );
      });
      
      // Verify each user's state is independent
      users.forEach((user, index) => {
        const savings = simnet.callReadOnlyFn(
          "bitsave",
          "get-savings",
          [Cl.principal(user)],
          deployer
        );
        const savingsData = savings.result.expectOk().expectSome().expectTuple();
        expect(savingsData["amount"]).toBeUint(amounts[index]);
      });
      
      // One user withdraws early
      simnet.mineEmptyBlocks(600);
      simnet.callPublicFn("bitsave", "withdraw", [], alice);
      
      // Other users should be unaffected
      [bob, charlie].forEach((user, index) => {
        const savings = simnet.callReadOnlyFn(
          "bitsave",
          "get-savings",
          [Cl.principal(user)],
          deployer
        );
        const savingsData = savings.result.expectOk().expectSome().expectTuple();
        expect(savingsData["claimed"]).toBeBool(false);
        expect(savingsData["amount"]).toBeUint(amounts[index + 1]);
      });
    });

    it("should maintain pause state consistency", () => {
      // Setup active user
      simnet.callPublicFn("bitsave", "deposit", [Cl.uint(5000000), Cl.uint(1000)], alice);
      
      // Pause contract
      const pauseResult = simnet.callPublicFn("bitsave", "pause-contract", [], deployer);
      expect(pauseResult.result).toBeOk();
      
      // Verify pause state
      const pauseStatus = simnet.callReadOnlyFn("bitsave", "is-paused", [], deployer);
      expect(pauseStatus.result).toBeOk(Cl.bool(true));
      
      // New deposits should fail
      const blockedDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(2000000), Cl.uint(500)],
        bob
      );
      expect(blockedDeposit.result).toBeErr(Cl.uint(106)); // ERR_CONTRACT_PAUSED
      
      // Existing user can still withdraw
      simnet.mineEmptyBlocks(1100);
      const withdrawResult = simnet.callPublicFn("bitsave", "withdraw", [], alice);
      expect(withdrawResult.result).toBeOk();
      
      // Unpause
      simnet.callPublicFn("bitsave", "unpause-contract", [], deployer);
      
      // New deposits should work again
      const resumedDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(3000000), Cl.uint(500)],
        bob
      );
      expect(resumedDeposit.result).toBeOk();
    });
  });

  describe("Data Structure Regression Tests", () => {
    it("should maintain deposit history integrity", () => {
      const historyCount = 15;
      
      // Create deposit history
      for (let i = 0; i < historyCount; i++) {
        const amount = 1000000 + (i * 200000);
        const period = 100 + (i * 50);
        
        simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(amount), Cl.uint(period)],
          alice
        );
        
        simnet.mineEmptyBlocks(period + 10);
        simnet.callPublicFn("bitsave", "withdraw", [], alice);
        simnet.mineEmptyBlocks(150);
      }
      
      // Verify history integrity
      const historyResult = simnet.callReadOnlyFn(
        "bitsave",
        "get-deposit-history",
        [Cl.principal(alice), Cl.uint(20)],
        deployer
      );
      
      expect(historyResult.result).toBeOk();
      const historyData = historyResult.result.expectOk().expectTuple();
      expect(historyData["total-deposits"]).toBeUint(historyCount);
      
      const history = historyData["history"].expectList();
      expect(history.length).toBe(historyCount);
    });

    it("should maintain event log integrity", () => {
      const eventCount = 25;
      
      // Generate various events
      for (let i = 0; i < eventCount; i++) {
        if (i % 3 === 0) {
          // Deposit/withdraw events
          simnet.callPublicFn("bitsave", "deposit", [Cl.uint(2000000), Cl.uint(100)], alice);
          simnet.mineEmptyBlocks(150);
          simnet.callPublicFn("bitsave", "withdraw", [], alice);
          simnet.mineEmptyBlocks(150);
        } else {
          // Admin events
          const newRate = 10 + (i % 10);
          simnet.callPublicFn("bitsave", "set-reward-rate", [Cl.uint(newRate)], deployer);
        }
      }
      
      // Verify event log
      const eventsResult = simnet.callReadOnlyFn(
        "bitsave",
        "get-contract-events",
        [Cl.uint(50)],
        deployer
      );
      
      expect(eventsResult.result).toBeOk();
      const eventData = eventsResult.result.expectOk().expectTuple();
      expect(eventData["total-events"]).toBeUint();
      
      const events = eventData["events"].expectList();
      expect(events.length).toBeGreaterThan(0);
    });

    it("should maintain reputation calculation consistency", () => {
      const reputationCycles = 10;
      
      for (let cycle = 0; cycle < reputationCycles; cycle++) {
        const amount = 3000000 + (cycle * 500000);
        const period = 500 + (cycle * 100);
        
        simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(amount), Cl.uint(period)],
          alice
        );
        
        simnet.mineEmptyBlocks(period + 10);
        
        const withdrawResult = simnet.callPublicFn("bitsave", "withdraw", [], alice);
        expect(withdrawResult.result).toBeOk();
        
        // Verify reputation progression
        const reputation = simnet.callReadOnlyFn(
          "bitsave",
          "get-reputation",
          [Cl.principal(alice)],
          deployer
        );
        const repData = reputation.result.expectOk().expectTuple();
        
        expect(repData["current-streak"]).toBeUint(cycle + 1);
        expect(repData["longest-streak"]).toBeUint(cycle + 1);
        expect(repData["points"]).toBeInt();
        
        simnet.mineEmptyBlocks(150);
      }
    });
  });

  describe("Error Handling Regression Tests", () => {
    it("should maintain proper error codes", () => {
      const errorTests = [
        {
          description: "Zero deposit amount",
          action: () => simnet.callPublicFn("bitsave", "deposit", [Cl.uint(0), Cl.uint(144)], alice),
          expectedError: 100 // ERR_NO_AMOUNT
        },
        {
          description: "Below minimum deposit",
          action: () => simnet.callPublicFn("bitsave", "deposit", [Cl.uint(500000), Cl.uint(144)], alice),
          expectedError: 107 // ERR_BELOW_MINIMUM
        },
        {
          description: "Above maximum deposit",
          action: () => simnet.callPublicFn("bitsave", "deposit", [Cl.uint(200000000000000), Cl.uint(144)], alice),
          expectedError: 108 // ERR_EXCEEDS_MAXIMUM
        },
        {
          description: "Double deposit",
          action: () => {
            simnet.callPublicFn("bitsave", "deposit", [Cl.uint(5000000), Cl.uint(144)], alice);
            return simnet.callPublicFn("bitsave", "deposit", [Cl.uint(3000000), Cl.uint(144)], alice);
          },
          expectedError: 101 // ERR_ALREADY_DEPOSITED
        },
        {
          description: "Withdraw without deposit",
          action: () => simnet.callPublicFn("bitsave", "withdraw", [], bob),
          expectedError: 104 // ERR_NO_DEPOSIT
        },
        {
          description: "Unauthorized admin action",
          action: () => simnet.callPublicFn("bitsave", "pause-contract", [], alice),
          expectedError: 105 // ERR_NOT_AUTHORIZED
        }
      ];
      
      errorTests.forEach(test => {
        const result = test.action();
        expect(result.result).toBeErr(Cl.uint(test.expectedError));
      });
    });

    it("should maintain error state recovery", () => {
      // Setup valid state
      simnet.callPublicFn("bitsave", "deposit", [Cl.uint(5000000), Cl.uint(1000)], alice);
      
      // Capture initial state
      const initialSavings = simnet.callReadOnlyFn(
        "bitsave",
        "get-savings",
        [Cl.principal(alice)],
        deployer
      );
      const initialData = initialSavings.result.expectOk().expectSome().expectTuple();
      
      // Attempt invalid operations
      const invalidOps = [
        () => simnet.callPublicFn("bitsave", "deposit", [Cl.uint(0), Cl.uint(100)], bob),
        () => simnet.callPublicFn("bitsave", "withdraw", [], bob),
        () => simnet.callPublicFn("bitsave", "set-reward-rate", [Cl.uint(20)], alice)
      ];
      
      invalidOps.forEach(op => {
        const result = op();
        expect(result.result).toBeErr();
      });
      
      // Verify original state unchanged
      const finalSavings = simnet.callReadOnlyFn(
        "bitsave",
        "get-savings",
        [Cl.principal(alice)],
        deployer
      );
      const finalData = finalSavings.result.expectOk().expectSome().expectTuple();
      
      expect(finalData["amount"]).toBeUint(initialData["amount"]);
      expect(finalData["unlock-height"]).toBeUint(initialData["unlock-height"]);
      expect(finalData["claimed"]).toBeBool(initialData["claimed"]);
    });
  });

  describe("Performance Regression Tests", () => {
    it("should maintain read-only function performance", () => {
      // Setup test data
      simnet.callPublicFn("bitsave", "deposit", [Cl.uint(10000000), Cl.uint(1000)], alice);
      
      const readOnlyFunctions = [
        { name: "get-savings", params: [Cl.principal(alice)] },
        { name: "get-reputation", params: [Cl.principal(alice)] },
        { name: "get-reward-rate", params: [] },
        { name: "is-paused", params: [] },
        { name: "get-minimum-deposit", params: [] }
      ];
      
      readOnlyFunctions.forEach(func => {
        const startTime = performance.now();
        
        const result = simnet.callReadOnlyFn("bitsave", func.name, func.params, deployer);
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        expect(result.result).toBeOk();
        expect(executionTime).toBeLessThan(50); // Should be fast
      });
    });

    it("should maintain batch operation performance", () => {
      const users = [alice, bob, charlie];
      
      // Setup data
      users.forEach(user => {
        simnet.callPublicFn("bitsave", "deposit", [Cl.uint(5000000), Cl.uint(1000)], user);
      });
      
      const startTime = performance.now();
      
      const batchResult = simnet.callReadOnlyFn(
        "bitsave",
        "batch-get-savings",
        [Cl.list(users.map(u => Cl.principal(u)))],
        deployer
      );
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(batchResult.result).toBeOk();
      expect(executionTime).toBeLessThan(100); // Should be reasonably fast
      
      const batchData = batchResult.result.expectOk().expectList();
      expect(batchData.length).toBe(3);
    });
  });

  describe("Integration Regression Tests", () => {
    it("should maintain cross-function integration", () => {
      // Test complete user flow integration
      const userFlow = [
        () => simnet.callPublicFn("bitsave", "deposit", [Cl.uint(8000000), Cl.uint(2000)], alice),
        () => simnet.mineEmptyBlocks(1000),
        () => simnet.callPublicFn("bitsave", "withdraw", [], alice),
        () => simnet.mineEmptyBlocks(150),
        () => simnet.callPublicFn("bitsave", "deposit", [Cl.uint(12000000), Cl.uint(3000)], alice),
        () => simnet.mineEmptyBlocks(3100),
        () => simnet.callPublicFn("bitsave", "withdraw", [], alice)
      ];
      
      userFlow.forEach((step, index) => {
        const result = step();
        if (typeof result === "object" && "result" in result) {
          expect(result.result).toBeOk();
        }
      });
      
      // Verify final state
      const finalReputation = simnet.callReadOnlyFn(
        "bitsave",
        "get-reputation",
        [Cl.principal(alice)],
        deployer
      );
      const repData = finalReputation.result.expectOk().expectTuple();
      expect(repData["current-streak"]).toBeUint(2);
    });

    it("should maintain admin-user interaction integration", () => {
      // Setup user deposit
      simnet.callPublicFn("bitsave", "deposit", [Cl.uint(10000000), Cl.uint(2000)], alice);
      
      // Admin changes parameters
      simnet.callPublicFn("bitsave", "set-reward-rate", [Cl.uint(25)], deployer);
      simnet.callPublicFn("bitsave", "set-early-withdrawal-penalty", [Cl.uint(30)], deployer);
      
      // User withdraws under new parameters
      simnet.mineEmptyBlocks(1000); // Early withdrawal
      
      const withdrawResult = simnet.callPublicFn("bitsave", "withdraw", [], alice);
      expect(withdrawResult.result).toBeOk();
      
      const withdrawData = withdrawResult.result.expectOk().expectTuple();
      expect(withdrawData["early-withdrawal"]).toBeBool(true);
      expect(withdrawData["penalty"]).toBeUint(3000000); // 30% penalty
      
      // Reset parameters
      simnet.callPublicFn("bitsave", "set-reward-rate", [Cl.uint(10)], deployer);
      simnet.callPublicFn("bitsave", "set-early-withdrawal-penalty", [Cl.uint(20)], deployer);
    });
  });
});
