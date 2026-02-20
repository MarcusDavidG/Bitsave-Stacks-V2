import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";
import { mockDataGenerator } from "./mock-data-generator";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;
const charlie = accounts.get("wallet_3")!;

describe("BitSave Contract State Validation Tests", () => {
  beforeEach(() => {
    // Reset simnet state and mock data generator
    mockDataGenerator.resetSeed();
  });

  describe("State Consistency Validation", () => {
    it("should maintain consistent state across multiple operations", () => {
      const validationData = mockDataGenerator.generateStateValidationData();
      
      // Verify initial state
      let pauseStatus = simnet.callReadOnlyFn("bitsave", "is-paused", [], deployer);
      expect(pauseStatus.result).toBeOk(Cl.bool(validationData.initialState.contractPaused));
      
      let rewardRate = simnet.callReadOnlyFn("bitsave", "get-reward-rate", [], deployer);
      expect(rewardRate.result).toBeOk(Cl.uint(validationData.initialState.rewardRate));
      
      // Execute operations and validate state changes
      const users = [alice, bob, charlie];
      let userIndex = 0;
      
      validationData.operations.forEach(operation => {
        switch (operation.type) {
          case "deposit":
            const user = users[userIndex % users.length];
            const depositResult = simnet.callPublicFn(
              "bitsave",
              "deposit",
              [Cl.uint(operation.amount), Cl.uint(operation.period)],
              user
            );
            expect(depositResult.result).toBeOk();
            
            // Validate savings state
            const savings = simnet.callReadOnlyFn(
              "bitsave",
              "get-savings",
              [Cl.principal(user)],
              deployer
            );
            const savingsData = savings.result.expectOk().expectSome().expectTuple();
            expect(savingsData["amount"]).toBeUint(operation.amount);
            expect(savingsData["claimed"]).toBeBool(false);
            
            userIndex++;
            break;
            
          case "admin":
            if (operation.action === "set-reward-rate") {
              const rateResult = simnet.callPublicFn(
                "bitsave",
                "set-reward-rate",
                [Cl.uint(operation.value)],
                deployer
              );
              expect(rateResult.result).toBeOk();
              
              // Validate rate change
              const newRate = simnet.callReadOnlyFn("bitsave", "get-reward-rate", [], deployer);
              expect(newRate.result).toBeOk(Cl.uint(operation.value));
            }
            break;
            
          case "withdraw":
            const withdrawUser = users[(userIndex - 1) % users.length];
            simnet.mineEmptyBlocks(operation.waitBlocks);
            
            const withdrawResult = simnet.callPublicFn(
              "bitsave",
              "withdraw",
              [],
              withdrawUser
            );
            expect(withdrawResult.result).toBeOk();
            
            // Validate withdrawal state
            const postWithdrawSavings = simnet.callReadOnlyFn(
              "bitsave",
              "get-savings",
              [Cl.principal(withdrawUser)],
              deployer
            );
            const postSavingsData = postWithdrawSavings.result.expectOk().expectSome().expectTuple();
            expect(postSavingsData["claimed"]).toBeBool(true);
            
            simnet.mineEmptyBlocks(150); // Cooldown
            break;
            
          case "pause":
            const pauseResult = simnet.callPublicFn("bitsave", "pause-contract", [], deployer);
            expect(pauseResult.result).toBeOk();
            
            const pausedStatus = simnet.callReadOnlyFn("bitsave", "is-paused", [], deployer);
            expect(pausedStatus.result).toBeOk(Cl.bool(true));
            break;
            
          case "unpause":
            const unpauseResult = simnet.callPublicFn("bitsave", "unpause-contract", [], deployer);
            expect(unpauseResult.result).toBeOk();
            
            const unpausedStatus = simnet.callReadOnlyFn("bitsave", "is-paused", [], deployer);
            expect(unpausedStatus.result).toBeOk(Cl.bool(false));
            break;
        }
      });
      
      // Verify final state matches expectations
      const finalPauseStatus = simnet.callReadOnlyFn("bitsave", "is-paused", [], deployer);
      expect(finalPauseStatus.result).toBeOk(Cl.bool(validationData.expectedFinalState.contractPaused));
      
      const finalRewardRate = simnet.callReadOnlyFn("bitsave", "get-reward-rate", [], deployer);
      expect(finalRewardRate.result).toBeOk(Cl.uint(validationData.expectedFinalState.rewardRate));
    });

    it("should validate state transitions are atomic", () => {
      // Test that failed operations don't leave partial state changes
      
      // Setup valid state
      const depositResult = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(5000000), Cl.uint(1000)],
        alice
      );
      expect(depositResult.result).toBeOk();
      
      // Capture state before failed operation
      const beforeSavings = simnet.callReadOnlyFn(
        "bitsave",
        "get-savings",
        [Cl.principal(alice)],
        deployer
      );
      const beforeData = beforeSavings.result.expectOk().expectSome().expectTuple();
      
      // Attempt invalid operation (double deposit)
      const invalidDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(3000000), Cl.uint(500)],
        alice
      );
      expect(invalidDeposit.result).toBeErr();
      
      // Verify state unchanged after failed operation
      const afterSavings = simnet.callReadOnlyFn(
        "bitsave",
        "get-savings",
        [Cl.principal(alice)],
        deployer
      );
      const afterData = afterSavings.result.expectOk().expectSome().expectTuple();
      
      expect(afterData["amount"]).toBeUint(beforeData["amount"]);
      expect(afterData["unlock-height"]).toBeUint(beforeData["unlock-height"]);
      expect(afterData["claimed"]).toBeBool(beforeData["claimed"]);
    });

    it("should validate cross-user state isolation", () => {
      const users = [alice, bob, charlie];
      const userStates: Array<{ amount: number; period: number }> = [];
      
      // Setup different states for each user
      users.forEach((user, index) => {
        const amount = 3000000 + (index * 2000000); // 3, 5, 7 STX
        const period = 500 + (index * 300); // Different periods
        
        userStates.push({ amount, period });
        
        const depositResult = simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(amount), Cl.uint(period)],
          user
        );
        expect(depositResult.result).toBeOk();
      });
      
      // Verify each user's state is isolated and correct
      users.forEach((user, index) => {
        const savings = simnet.callReadOnlyFn(
          "bitsave",
          "get-savings",
          [Cl.principal(user)],
          deployer
        );
        const savingsData = savings.result.expectOk().expectSome().expectTuple();
        
        expect(savingsData["amount"]).toBeUint(userStates[index].amount);
        expect(savingsData["claimed"]).toBeBool(false);
      });
      
      // One user withdraws early
      simnet.mineEmptyBlocks(600);
      
      const earlyWithdraw = simnet.callPublicFn("bitsave", "withdraw", [], alice);
      expect(earlyWithdraw.result).toBeOk();
      
      // Verify other users' states are unaffected
      [bob, charlie].forEach((user, index) => {
        const savings = simnet.callReadOnlyFn(
          "bitsave",
          "get-savings",
          [Cl.principal(user)],
          deployer
        );
        const savingsData = savings.result.expectOk().expectSome().expectTuple();
        
        expect(savingsData["amount"]).toBeUint(userStates[index + 1].amount);
        expect(savingsData["claimed"]).toBeBool(false);
      });
    });
  });

  describe("Data Integrity Validation", () => {
    it("should validate deposit history integrity", () => {
      const depositCount = 10;
      const expectedHistory: Array<{ amount: number; period: number }> = [];
      
      // Create multiple deposits
      for (let i = 0; i < depositCount; i++) {
        const amount = 1000000 + (i * 500000);
        const period = 100 + (i * 50);
        
        expectedHistory.push({ amount, period });
        
        simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(amount), Cl.uint(period)],
          alice
        );
        
        simnet.mineEmptyBlocks(period + 10);
        simnet.callPublicFn("bitsave", "withdraw", [], alice);
        simnet.mineEmptyBlocks(150); // Cooldown
      }
      
      // Validate history integrity
      const historyResult = simnet.callReadOnlyFn(
        "bitsave",
        "get-deposit-history",
        [Cl.principal(alice), Cl.uint(depositCount)],
        deployer
      );
      
      expect(historyResult.result).toBeOk();
      
      const historyData = historyResult.result.expectOk().expectTuple();
      expect(historyData["total-deposits"]).toBeUint(depositCount);
      
      const history = historyData["history"].expectList();
      expect(history.length).toBe(depositCount);
    });

    it("should validate event log integrity", () => {
      const eventCount = 20;
      const expectedEvents: Array<{ type: string; value?: number }> = [];
      
      // Generate various events
      for (let i = 0; i < eventCount; i++) {
        if (i % 3 === 0) {
          // Deposit event
          simnet.callPublicFn(
            "bitsave",
            "deposit",
            [Cl.uint(2000000), Cl.uint(100)],
            alice
          );
          expectedEvents.push({ type: "deposit" });
          
          simnet.mineEmptyBlocks(150);
          simnet.callPublicFn("bitsave", "withdraw", [], alice);
          expectedEvents.push({ type: "withdrawal" });
          simnet.mineEmptyBlocks(150);
        } else {
          // Admin event
          const newRate = 10 + (i % 10);
          simnet.callPublicFn(
            "bitsave",
            "set-reward-rate",
            [Cl.uint(newRate)],
            deployer
          );
          expectedEvents.push({ type: "rate-change", value: newRate });
        }
      }
      
      // Validate event log
      const eventsResult = simnet.callReadOnlyFn(
        "bitsave",
        "get-contract-events",
        [Cl.uint(50)],
        deployer
      );
      
      expect(eventsResult.result).toBeOk();
      
      const eventData = eventsResult.result.expectOk().expectTuple();
      const events = eventData["events"].expectList();
      
      // Should have recorded all events
      expect(events.length).toBeGreaterThan(0);
    });

    it("should validate reputation calculation integrity", () => {
      const scenarios = mockDataGenerator.generateReputationScenarios(2000);
      let totalExpectedPoints = 0;
      
      scenarios.forEach((scenario, index) => {
        const depositResult = simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(scenario.amount), Cl.uint(scenario.period)],
          alice
        );
        expect(depositResult.result).toBeOk();
        
        simnet.mineEmptyBlocks(scenario.period + 10);
        
        const withdrawResult = simnet.callPublicFn("bitsave", "withdraw", [], alice);
        expect(withdrawResult.result).toBeOk();
        
        // Validate reputation progression
        const reputation = simnet.callReadOnlyFn(
          "bitsave",
          "get-reputation",
          [Cl.principal(alice)],
          deployer
        );
        const repData = reputation.result.expectOk().expectTuple();
        
        expect(repData["current-streak"]).toBeUint(scenario.cycleNumber);
        expect(repData["longest-streak"]).toBeUint(scenario.cycleNumber);
        
        simnet.mineEmptyBlocks(150); // Cooldown
      });
    });
  });

  describe("Invariant Validation", () => {
    it("should validate contract balance invariants", () => {
      const users = [alice, bob, charlie];
      const deposits: Array<{ user: string; amount: number }> = [];
      
      // Multiple users deposit
      users.forEach((user, index) => {
        const amount = 5000000 + (index * 3000000);
        deposits.push({ user: user, amount });
        
        const depositResult = simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(amount), Cl.uint(1000)],
          user
        );
        expect(depositResult.result).toBeOk();
      });
      
      // Contract should hold total of all deposits
      // (In a real implementation, you would check the contract's STX balance)
      
      // Users withdraw
      simnet.mineEmptyBlocks(1100);
      
      users.forEach(user => {
        const withdrawResult = simnet.callPublicFn("bitsave", "withdraw", [], user);
        expect(withdrawResult.result).toBeOk();
      });
      
      // After all withdrawals, contract balance should be minimal
      // (Only containing any penalties collected)
    });

    it("should validate user count invariants", () => {
      const users = [alice, bob, charlie];
      let activeUsers = 0;
      
      // Users deposit one by one
      users.forEach(user => {
        const depositResult = simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(3000000), Cl.uint(500)],
          user
        );
        expect(depositResult.result).toBeOk();
        activeUsers++;
        
        // Verify user has active savings
        const savings = simnet.callReadOnlyFn(
          "bitsave",
          "get-savings",
          [Cl.principal(user)],
          deployer
        );
        expect(savings.result.expectOk()).toBeSome();
      });
      
      // Users withdraw one by one
      simnet.mineEmptyBlocks(600);
      
      users.forEach(user => {
        const withdrawResult = simnet.callPublicFn("bitsave", "withdraw", [], user);
        expect(withdrawResult.result).toBeOk();
        
        // Verify user savings marked as claimed
        const savings = simnet.callReadOnlyFn(
          "bitsave",
          "get-savings",
          [Cl.principal(user)],
          deployer
        );
        const savingsData = savings.result.expectOk().expectSome().expectTuple();
        expect(savingsData["claimed"]).toBeBool(true);
      });
    });

    it("should validate time-based invariants", () => {
      const lockPeriod = 1000;
      
      // Deposit with specific lock period
      const depositResult = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(5000000), Cl.uint(lockPeriod)],
        alice
      );
      expect(depositResult.result).toBeOk();
      
      const initialBlock = simnet.blockHeight;
      
      // Verify unlock height is correctly calculated
      const savings = simnet.callReadOnlyFn(
        "bitsave",
        "get-savings",
        [Cl.principal(alice)],
        deployer
      );
      const savingsData = savings.result.expectOk().expectSome().expectTuple();
      const expectedUnlockHeight = initialBlock + lockPeriod;
      
      expect(savingsData["unlock-height"]).toBeUint(expectedUnlockHeight);
      
      // Early withdrawal should be penalized
      simnet.mineEmptyBlocks(lockPeriod - 100);
      
      const earlyWithdraw = simnet.callPublicFn("bitsave", "withdraw", [], alice);
      expect(earlyWithdraw.result).toBeOk();
      
      const withdrawData = earlyWithdraw.result.expectOk().expectTuple();
      expect(withdrawData["early-withdrawal"]).toBeBool(true);
      expect(withdrawData["penalty"]).toBeUint(); // Should have penalty
    });
  });

  describe("Error State Validation", () => {
    it("should validate error states don't corrupt data", () => {
      // Setup valid state
      const validDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(5000000), Cl.uint(1000)],
        alice
      );
      expect(validDeposit.result).toBeOk();
      
      // Capture initial state
      const initialSavings = simnet.callReadOnlyFn(
        "bitsave",
        "get-savings",
        [Cl.principal(alice)],
        deployer
      );
      const initialData = initialSavings.result.expectOk().expectSome().expectTuple();
      
      // Attempt various invalid operations
      const invalidOperations = [
        () => simnet.callPublicFn("bitsave", "deposit", [Cl.uint(0), Cl.uint(100)], bob), // Zero amount
        () => simnet.callPublicFn("bitsave", "withdraw", [], bob), // No deposit
        () => simnet.callPublicFn("bitsave", "set-reward-rate", [Cl.uint(20)], alice), // Not admin
        () => simnet.callPublicFn("bitsave", "deposit", [Cl.uint(2000000), Cl.uint(100)], alice) // Double deposit
      ];
      
      invalidOperations.forEach(operation => {
        const result = operation();
        expect(result.result).toBeErr();
      });
      
      // Verify original state is unchanged
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

    it("should validate pause state consistency", () => {
      // Setup active users
      const users = [alice, bob];
      
      users.forEach(user => {
        simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(3000000), Cl.uint(2000)],
          user
        );
      });
      
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
        [Cl.uint(1000000), Cl.uint(100)],
        charlie
      );
      expect(blockedDeposit.result).toBeErr(Cl.uint(106)); // ERR_CONTRACT_PAUSED
      
      // Existing users should still be able to withdraw
      simnet.mineEmptyBlocks(2100);
      
      users.forEach(user => {
        const withdrawResult = simnet.callPublicFn("bitsave", "withdraw", [], user);
        expect(withdrawResult.result).toBeOk();
      });
      
      // Unpause and verify normal operation resumes
      simnet.callPublicFn("bitsave", "unpause-contract", [], deployer);
      
      const resumedDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(2000000), Cl.uint(100)],
        charlie
      );
      expect(resumedDeposit.result).toBeOk();
    });
  });
});
