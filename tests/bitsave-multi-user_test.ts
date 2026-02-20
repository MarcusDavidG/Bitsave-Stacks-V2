import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";
import { mockDataGenerator } from "./mock-data-generator";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;
const charlie = accounts.get("wallet_3")!;

describe("BitSave Multi-User Interaction Tests", () => {
  beforeEach(() => {
    // Reset simnet state and mock data generator
    mockDataGenerator.resetSeed();
  });

  describe("Concurrent User Operations", () => {
    it("should handle simultaneous deposits from multiple users", () => {
      const users = [alice, bob, charlie];
      const depositAmounts = [3000000, 5000000, 7000000]; // 3, 5, 7 STX
      const lockPeriods = [500, 1000, 1500];
      
      // All users deposit simultaneously
      users.forEach((user, index) => {
        const depositResult = simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(depositAmounts[index]), Cl.uint(lockPeriods[index])],
          user
        );
        expect(depositResult.result).toBeOk();
      });
      
      // Verify all deposits were recorded correctly
      users.forEach((user, index) => {
        const savings = simnet.callReadOnlyFn(
          "bitsave",
          "get-savings",
          [Cl.principal(user)],
          deployer
        );
        const savingsData = savings.result.expectOk().expectSome().expectTuple();
        
        expect(savingsData["amount"]).toBeUint(depositAmounts[index]);
        expect(savingsData["claimed"]).toBeBool(false);
      });
      
      // Test batch retrieval
      const batchResult = simnet.callReadOnlyFn(
        "bitsave",
        "batch-get-savings",
        [Cl.list(users.map(u => Cl.principal(u)))],
        deployer
      );
      
      expect(batchResult.result).toBeOk();
      const batchData = batchResult.result.expectOk().expectList();
      expect(batchData.length).toBe(3);
    });

    it("should handle staggered withdrawals correctly", () => {
      const users = [alice, bob, charlie];
      const amounts = [2000000, 4000000, 6000000];
      const periods = [300, 600, 900];
      
      // Setup deposits
      users.forEach((user, index) => {
        simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(amounts[index]), Cl.uint(periods[index])],
          user
        );
      });
      
      // Alice withdraws first (shortest lock)
      simnet.mineEmptyBlocks(350);
      
      const aliceWithdraw = simnet.callPublicFn("bitsave", "withdraw", [], alice);
      expect(aliceWithdraw.result).toBeOk();
      
      // Verify Alice's withdrawal doesn't affect others
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
      
      // Bob withdraws next
      simnet.mineEmptyBlocks(300);
      
      const bobWithdraw = simnet.callPublicFn("bitsave", "withdraw", [], bob);
      expect(bobWithdraw.result).toBeOk();
      
      // Charlie still has active savings
      const charlieSavings = simnet.callReadOnlyFn(
        "bitsave",
        "get-savings",
        [Cl.principal(charlie)],
        deployer
      );
      const charlieData = charlieSavings.result.expectOk().expectSome().expectTuple();
      expect(charlieData["claimed"]).toBeBool(false);
      
      // Charlie withdraws last
      simnet.mineEmptyBlocks(300);
      
      const charlieWithdraw = simnet.callPublicFn("bitsave", "withdraw", [], charlie);
      expect(charlieWithdraw.result).toBeOk();
    });

    it("should handle mixed early and mature withdrawals", () => {
      const users = [alice, bob, charlie];
      const lockPeriod = 1000;
      
      // All users deposit with same lock period
      users.forEach(user => {
        simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(5000000), Cl.uint(lockPeriod)],
          user
        );
      });
      
      // Alice withdraws early
      simnet.mineEmptyBlocks(500);
      
      const aliceEarlyWithdraw = simnet.callPublicFn("bitsave", "withdraw", [], alice);
      expect(aliceEarlyWithdraw.result).toBeOk();
      
      const aliceData = aliceEarlyWithdraw.result.expectOk().expectTuple();
      expect(aliceData["early-withdrawal"]).toBeBool(true);
      expect(aliceData["penalty"]).toBeUint(1000000); // 20% penalty
      expect(aliceData["earned-points"]).toBeInt(0); // No points for early withdrawal
      
      // Bob and Charlie wait for maturity
      simnet.mineEmptyBlocks(600);
      
      const bobMatureWithdraw = simnet.callPublicFn("bitsave", "withdraw", [], bob);
      expect(bobMatureWithdraw.result).toBeOk();
      
      const bobData = bobMatureWithdraw.result.expectOk().expectTuple();
      expect(bobData["early-withdrawal"]).toBeBool(false);
      expect(bobData["penalty"]).toBeUint(0);
      expect(bobData["earned-points"]).toBeInt(); // Should have earned points
      
      simnet.mineEmptyBlocks(150); // Cooldown
      
      const charlieMatureWithdraw = simnet.callPublicFn("bitsave", "withdraw", [], charlie);
      expect(charlieMatureWithdraw.result).toBeOk();
      
      const charlieData = charlieMatureWithdraw.result.expectOk().expectTuple();
      expect(charlieData["early-withdrawal"]).toBeBool(false);
      expect(charlieData["penalty"]).toBeUint(0);
    });
  });

  describe("Competitive Scenarios", () => {
    it("should handle reputation competition between users", () => {
      const competitors = [alice, bob, charlie];
      const rounds = 4;
      
      for (let round = 0; round < rounds; round++) {
        // Each user deposits with different strategies
        competitors.forEach((user, index) => {
          const baseAmount = 3000000;
          const amount = baseAmount + (index * 1000000) + (round * 500000);
          const period = 500 + (index * 200) + (round * 100);
          
          const depositResult = simnet.callPublicFn(
            "bitsave",
            "deposit",
            [Cl.uint(amount), Cl.uint(period)],
            user
          );
          expect(depositResult.result).toBeOk();
        });
        
        // Wait for all to mature
        simnet.mineEmptyBlocks(1200 + (round * 100));
        
        // All withdraw
        competitors.forEach(user => {
          const withdrawResult = simnet.callPublicFn("bitsave", "withdraw", [], user);
          expect(withdrawResult.result).toBeOk();
        });
        
        // Check reputation progression
        competitors.forEach((user, index) => {
          const reputation = simnet.callReadOnlyFn(
            "bitsave",
            "get-reputation",
            [Cl.principal(user)],
            deployer
          );
          const repData = reputation.result.expectOk().expectTuple();
          
          expect(repData["current-streak"]).toBeUint(round + 1);
          expect(repData["points"]).toBeInt();
        });
        
        // Cooldown
        simnet.mineEmptyBlocks(150);
      }
      
      // Compare final reputations
      const finalReputations = competitors.map(user => {
        const reputation = simnet.callReadOnlyFn(
          "bitsave",
          "get-reputation",
          [Cl.principal(user)],
          deployer
        );
        return reputation.result.expectOk().expectTuple();
      });
      
      // Charlie should have highest reputation (largest deposits + longest locks)
      const charliePoints = finalReputations[2]["points"].expectInt();
      const alicePoints = finalReputations[0]["points"].expectInt();
      const bobPoints = finalReputations[1]["points"].expectInt();
      
      expect(charliePoints).toBeGreaterThan(bobPoints);
      expect(bobPoints).toBeGreaterThan(alicePoints);
    });

    it("should handle different user strategies simultaneously", () => {
      const userStrategies = mockDataGenerator.generateUserScenarios(4);
      const users = [alice, bob, charlie, deployer];
      
      // Execute different strategies
      userStrategies.forEach((strategy, index) => {
        const user = users[index];
        
        const depositResult = simnet.callPublicFn(
          "bitsave",
          "deposit-with-goal",
          [
            Cl.uint(strategy.amount),
            Cl.uint(strategy.period),
            Cl.uint(strategy.goalAmount),
            Cl.utf8(strategy.goalDescription)
          ],
          user
        );
        expect(depositResult.result).toBeOk();
        
        // Verify goal tracking
        const goalProgress = simnet.callReadOnlyFn(
          "bitsave",
          "get-savings-goal",
          [Cl.principal(user)],
          user
        );
        const goalData = goalProgress.result.expectOk().expectTuple();
        expect(goalData["goal-amount"]).toBeUint(strategy.goalAmount);
      });
      
      // Simulate different withdrawal behaviors
      userStrategies.forEach((strategy, index) => {
        const user = users[index];
        
        if (strategy.userType === "conservative") {
          // Conservative users withdraw early if needed
          simnet.mineEmptyBlocks(Math.floor(strategy.period * 0.5));
        } else {
          // Others wait for maturity
          simnet.mineEmptyBlocks(strategy.period + 10);
        }
        
        const withdrawResult = simnet.callPublicFn("bitsave", "withdraw", [], user);
        expect(withdrawResult.result).toBeOk();
        
        const withdrawData = withdrawResult.result.expectOk().expectTuple();
        
        if (strategy.userType === "conservative") {
          expect(withdrawData["early-withdrawal"]).toBeBool(true);
        } else {
          expect(withdrawData["early-withdrawal"]).toBeBool(false);
        }
        
        simnet.mineEmptyBlocks(150); // Cooldown
      });
    });
  });

  describe("Social Interaction Patterns", () => {
    it("should handle copycat behavior patterns", () => {
      // Alice makes a successful deposit
      const aliceDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(10000000), Cl.uint(2000)], // 10 STX, 2000 blocks
        alice
      );
      expect(aliceDeposit.result).toBeOk();
      
      // Bob and Charlie copy Alice's strategy
      [bob, charlie].forEach(user => {
        const copyDeposit = simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(10000000), Cl.uint(2000)], // Same as Alice
          user
        );
        expect(copyDeposit.result).toBeOk();
      });
      
      // All wait and withdraw together
      simnet.mineEmptyBlocks(2100);
      
      [alice, bob, charlie].forEach(user => {
        const withdrawResult = simnet.callPublicFn("bitsave", "withdraw", [], user);
        expect(withdrawResult.result).toBeOk();
        
        const withdrawData = withdrawResult.result.expectOk().expectTuple();
        expect(withdrawData["early-withdrawal"]).toBeBool(false);
        
        // All should have similar rewards (same amount, same period)
        expect(withdrawData["earned-points"]).toBeInt();
      });
    });

    it("should handle peer pressure scenarios", () => {
      // Alice starts with small deposit
      simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(2000000), Cl.uint(500)],
        alice
      );
      
      // Bob makes larger deposit (peer pressure)
      simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(8000000), Cl.uint(1500)],
        bob
      );
      
      // Alice withdraws early due to pressure
      simnet.mineEmptyBlocks(300);
      
      const aliceEarlyWithdraw = simnet.callPublicFn("bitsave", "withdraw", [], alice);
      expect(aliceEarlyWithdraw.result).toBeOk();
      
      const aliceData = aliceEarlyWithdraw.result.expectOk().expectTuple();
      expect(aliceData["early-withdrawal"]).toBeBool(true);
      
      // Bob sticks to plan
      simnet.mineEmptyBlocks(1300);
      
      const bobWithdraw = simnet.callPublicFn("bitsave", "withdraw", [], bob);
      expect(bobWithdraw.result).toBeOk();
      
      const bobData = bobWithdraw.result.expectOk().expectTuple();
      expect(bobData["early-withdrawal"]).toBeBool(false);
      
      // Bob should have much higher reputation
      const bobReputation = simnet.callReadOnlyFn(
        "bitsave",
        "get-reputation",
        [Cl.principal(bob)],
        deployer
      );
      const aliceReputation = simnet.callReadOnlyFn(
        "bitsave",
        "get-reputation",
        [Cl.principal(alice)],
        deployer
      );
      
      const bobPoints = bobReputation.result.expectOk().expectTuple()["points"].expectInt();
      const alicePoints = aliceReputation.result.expectOk().expectTuple()["points"].expectInt();
      
      expect(bobPoints).toBeGreaterThan(alicePoints);
    });

    it("should handle group coordination scenarios", () => {
      const groupUsers = [alice, bob, charlie];
      const coordinatedAmount = 5000000; // 5 STX each
      const coordinatedPeriod = 1000; // Same lock period
      
      // Group coordinates to deposit together
      groupUsers.forEach(user => {
        const depositResult = simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(coordinatedAmount), Cl.uint(coordinatedPeriod)],
          user
        );
        expect(depositResult.result).toBeOk();
      });
      
      // Check group status with batch operation
      const groupStatus = simnet.callReadOnlyFn(
        "bitsave",
        "batch-get-savings",
        [Cl.list(groupUsers.map(u => Cl.principal(u)))],
        deployer
      );
      
      expect(groupStatus.result).toBeOk();
      const groupData = groupStatus.result.expectOk().expectList();
      
      // All should have same deposit amount
      groupData.forEach(userData => {
        const userTuple = userData.expectTuple();
        const savings = userTuple["savings"].expectSome().expectTuple();
        expect(savings["amount"]).toBeUint(coordinatedAmount);
      });
      
      // Group coordinates withdrawal timing
      simnet.mineEmptyBlocks(coordinatedPeriod + 10);
      
      groupUsers.forEach(user => {
        const withdrawResult = simnet.callPublicFn("bitsave", "withdraw", [], user);
        expect(withdrawResult.result).toBeOk();
        
        const withdrawData = withdrawResult.result.expectOk().expectTuple();
        expect(withdrawData["early-withdrawal"]).toBeBool(false);
        expect(withdrawData["earned-points"]).toBeInt();
      });
    });
  });

  describe("Market Dynamics Simulation", () => {
    it("should simulate market response to parameter changes", () => {
      const users = [alice, bob, charlie];
      
      // Initial market conditions - users deposit
      users.forEach((user, index) => {
        const amount = 3000000 + (index * 2000000);
        simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(amount), Cl.uint(2000)],
          user
        );
      });
      
      // Admin increases reward rate (market stimulus)
      simnet.callPublicFn("bitsave", "set-reward-rate", [Cl.uint(25)], deployer);
      
      // Market responds - more users want to deposit but can't (already have deposits)
      // Simulate new user trying to enter market
      const newUserDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(10000000), Cl.uint(3000)], // Larger deposit due to higher rate
        deployer
      );
      expect(newUserDeposit.result).toBeOk();
      
      // Admin later reduces rate (market cooling)
      simnet.callPublicFn("bitsave", "set-reward-rate", [Cl.uint(8)], deployer);
      
      // Users react differently to rate change
      simnet.mineEmptyBlocks(1000);
      
      // Some users withdraw early due to rate reduction
      const aliceEarlyExit = simnet.callPublicFn("bitsave", "withdraw", [], alice);
      expect(aliceEarlyExit.result).toBeOk();
      
      // Others stick to original plan
      simnet.mineEmptyBlocks(1100);
      
      [bob, charlie, deployer].forEach(user => {
        const withdrawResult = simnet.callPublicFn("bitsave", "withdraw", [], user);
        expect(withdrawResult.result).toBeOk();
      });
      
      // Reset rate
      simnet.callPublicFn("bitsave", "set-reward-rate", [Cl.uint(10)], deployer);
    });

    it("should simulate network effects and adoption", () => {
      // Early adopter
      const earlyAdopterDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(20000000), Cl.uint(5000)], // Large, long-term deposit
        alice
      );
      expect(earlyAdopterDeposit.result).toBeOk();
      
      // Early adopter builds reputation
      simnet.mineEmptyBlocks(5100);
      
      const earlyWithdraw = simnet.callPublicFn("bitsave", "withdraw", [], alice);
      expect(earlyWithdraw.result).toBeOk();
      
      // Check Alice's reputation (should be high)
      const aliceReputation = simnet.callReadOnlyFn(
        "bitsave",
        "get-reputation",
        [Cl.principal(alice)],
        deployer
      );
      const aliceRepData = aliceReputation.result.expectOk().expectTuple();
      
      // Network effect - others see Alice's success and join
      simnet.mineEmptyBlocks(150); // Cooldown
      
      [bob, charlie].forEach((user, index) => {
        // Followers make smaller deposits initially
        const amount = 5000000 + (index * 2000000);
        const period = 1000 + (index * 500);
        
        const followerDeposit = simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(amount), Cl.uint(period)],
          user
        );
        expect(followerDeposit.result).toBeOk();
      });
      
      // Alice makes second deposit (network leader behavior)
      const aliceSecondDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(25000000), Cl.uint(6000)], // Even larger
        alice
      );
      expect(aliceSecondDeposit.result).toBeOk();
      
      // Followers mature and withdraw
      simnet.mineEmptyBlocks(2000);
      
      [bob, charlie].forEach(user => {
        const withdrawResult = simnet.callPublicFn("bitsave", "withdraw", [], user);
        expect(withdrawResult.result).toBeOk();
      });
    });
  });

  describe("System Load and Scalability", () => {
    it("should handle high user concurrency", () => {
      const users = [alice, bob, charlie, deployer];
      const operationsPerUser = 5;
      
      // Simulate high concurrent activity
      for (let round = 0; round < operationsPerUser; round++) {
        // All users deposit in same block
        users.forEach((user, index) => {
          const amount = 2000000 + (index * 1000000) + (round * 500000);
          const period = 300 + (round * 100);
          
          const depositResult = simnet.callPublicFn(
            "bitsave",
            "deposit",
            [Cl.uint(amount), Cl.uint(period)],
            user
          );
          expect(depositResult.result).toBeOk();
        });
        
        // Wait for maturity
        simnet.mineEmptyBlocks(400 + (round * 100));
        
        // All users withdraw in same timeframe
        users.forEach(user => {
          const withdrawResult = simnet.callPublicFn("bitsave", "withdraw", [], user);
          expect(withdrawResult.result).toBeOk();
        });
        
        // Cooldown
        simnet.mineEmptyBlocks(150);
      }
      
      // Verify system integrity after high load
      users.forEach(user => {
        const reputation = simnet.callReadOnlyFn(
          "bitsave",
          "get-reputation",
          [Cl.principal(user)],
          deployer
        );
        const repData = reputation.result.expectOk().expectTuple();
        expect(repData["current-streak"]).toBeUint(operationsPerUser);
      });
    });

    it("should maintain performance with many users", () => {
      const users = [alice, bob, charlie, deployer];
      
      // Setup many users with deposits
      users.forEach((user, index) => {
        const amount = 5000000 + (index * 1000000);
        simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(amount), Cl.uint(1000)],
          user
        );
      });
      
      // Test batch operations performance
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
      expect(executionTime).toBeLessThan(100); // Should be fast even with many users
      
      const batchData = batchResult.result.expectOk().expectList();
      expect(batchData.length).toBe(users.length);
    });
  });
});
