import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;
const charlie = accounts.get("wallet_3")!;

describe("BitSave Integration Test Scenarios", () => {
  beforeEach(() => {
    // Reset simnet state before each test
  });

  describe("Complete User Journey Tests", () => {
    it("should handle complete new user onboarding flow", () => {
      // Step 1: New user checks contract status
      const pauseStatus = simnet.callReadOnlyFn(
        "bitsave",
        "is-paused",
        [],
        alice
      );
      expect(pauseStatus.result).toBeOk(Cl.bool(false));
      
      // Step 2: User checks minimum deposit requirement
      const minDeposit = simnet.callReadOnlyFn(
        "bitsave",
        "get-minimum-deposit",
        [],
        alice
      );
      expect(minDeposit.result).toBeOk(Cl.uint(1000000));
      
      // Step 3: User checks current reward rate
      const rewardRate = simnet.callReadOnlyFn(
        "bitsave",
        "get-reward-rate",
        [],
        alice
      );
      expect(rewardRate.result).toBeOk(Cl.uint(10));
      
      // Step 4: User makes first deposit with goal
      const firstDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit-with-goal",
        [
          Cl.uint(5000000), // 5 STX
          Cl.uint(4320), // ~1 month
          Cl.uint(50000000), // Goal: 50 STX
          Cl.utf8("Emergency fund")
        ],
        alice
      );
      expect(firstDeposit.result).toBeOk();
      
      // Step 5: User checks their savings status
      const savings = simnet.callReadOnlyFn(
        "bitsave",
        "get-savings",
        [Cl.principal(alice)],
        alice
      );
      const savingsData = savings.result.expectOk().expectSome().expectTuple();
      expect(savingsData["amount"]).toBeUint(5000000);
      expect(savingsData["claimed"]).toBeBool(false);
      
      // Step 6: User checks their goal progress
      const goalProgress = simnet.callReadOnlyFn(
        "bitsave",
        "get-savings-goal",
        [Cl.principal(alice)],
        alice
      );
      const goalData = goalProgress.result.expectOk().expectTuple();
      expect(goalData["goal-amount"]).toBeUint(50000000);
      expect(goalData["progress-percent"]).toBeUint(10); // 5/50 = 10%
      
      // Step 7: Time passes, user waits for maturity
      simnet.mineEmptyBlocks(4330);
      
      // Step 8: User withdraws with rewards
      const withdrawal = simnet.callPublicFn(
        "bitsave",
        "withdraw",
        [],
        alice
      );
      expect(withdrawal.result).toBeOk();
      
      const withdrawData = withdrawal.result.expectOk().expectTuple();
      expect(withdrawData["early-withdrawal"]).toBeBool(false);
      expect(withdrawData["earned-points"]).toBeInt();
      
      // Step 9: User checks final reputation
      const reputation = simnet.callReadOnlyFn(
        "bitsave",
        "get-reputation",
        [Cl.principal(alice)],
        alice
      );
      const repData = reputation.result.expectOk().expectTuple();
      expect(repData["current-streak"]).toBeUint(1);
      expect(repData["longest-streak"]).toBeUint(1);
    });

    it("should handle experienced user with multiple cycles", () => {
      // Simulate experienced user with multiple deposit-withdraw cycles
      const cycles = 5;
      
      for (let i = 0; i < cycles; i++) {
        // Deposit with increasing amounts
        const amount = 2000000 + (i * 1000000); // 2-6 STX
        const period = 500 + (i * 200); // Increasing lock periods
        
        const deposit = simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(amount), Cl.uint(period)],
          alice
        );
        expect(deposit.result).toBeOk();
        
        // Wait for maturity
        simnet.mineEmptyBlocks(period + 10);
        
        // Withdraw
        const withdraw = simnet.callPublicFn(
          "bitsave",
          "withdraw",
          [],
          alice
        );
        expect(withdraw.result).toBeOk();
        
        // Check streak progression
        const reputation = simnet.callReadOnlyFn(
          "bitsave",
          "get-reputation",
          [Cl.principal(alice)],
          alice
        );
        const repData = reputation.result.expectOk().expectTuple();
        expect(repData["current-streak"]).toBeUint(i + 1);
        
        // Wait for cooldown
        simnet.mineEmptyBlocks(150);
      }
      
      // Check final deposit history
      const history = simnet.callReadOnlyFn(
        "bitsave",
        "get-deposit-history",
        [Cl.principal(alice), Cl.uint(10)],
        alice
      );
      const historyData = history.result.expectOk().expectTuple();
      expect(historyData["total-deposits"]).toBeUint(cycles);
    });

    it("should handle user with early withdrawal scenario", () => {
      // User makes deposit
      const deposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(10000000), Cl.uint(5000)], // 10 STX, long lock
        alice
      );
      expect(deposit.result).toBeOk();
      
      // User needs emergency withdrawal
      simnet.mineEmptyBlocks(1000); // Only partial way through lock
      
      const earlyWithdraw = simnet.callPublicFn(
        "bitsave",
        "withdraw",
        [],
        alice
      );
      expect(earlyWithdraw.result).toBeOk();
      
      const withdrawData = earlyWithdraw.result.expectOk().expectTuple();
      expect(withdrawData["early-withdrawal"]).toBeBool(true);
      expect(withdrawData["penalty"]).toBeUint(2000000); // 20% penalty
      expect(withdrawData["withdrawn"]).toBeUint(8000000); // 80% received
      expect(withdrawData["earned-points"]).toBeInt(0); // No reputation points
      
      // User's reputation should show no streak
      const reputation = simnet.callReadOnlyFn(
        "bitsave",
        "get-reputation",
        [Cl.principal(alice)],
        alice
      );
      const repData = reputation.result.expectOk().expectTuple();
      expect(repData["points"]).toBeInt(0);
    });
  });

  describe("Multi-User Interaction Tests", () => {
    it("should handle multiple users with different strategies", () => {
      const users = [
        { user: alice, strategy: "conservative", amount: 3000000, period: 1000 },
        { user: bob, strategy: "aggressive", amount: 20000000, period: 10000 },
        { user: charlie, strategy: "moderate", amount: 8000000, period: 4320 }
      ];
      
      // All users deposit simultaneously
      users.forEach(({ user, amount, period }) => {
        const deposit = simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(amount), Cl.uint(period)],
          user
        );
        expect(deposit.result).toBeOk();
      });
      
      // Check batch status
      const batchSavings = simnet.callReadOnlyFn(
        "bitsave",
        "batch-get-savings",
        [Cl.list(users.map(u => Cl.principal(u.user)))],
        deployer
      );
      expect(batchSavings.result).toBeOk();
      
      const batchData = batchSavings.result.expectOk().expectList();
      expect(batchData.length).toBe(3);
      
      // Conservative user withdraws first (shortest lock)
      simnet.mineEmptyBlocks(1100);
      
      const aliceWithdraw = simnet.callPublicFn(
        "bitsave",
        "withdraw",
        [],
        alice
      );
      expect(aliceWithdraw.result).toBeOk();
      
      // Moderate user withdraws next
      simnet.mineEmptyBlocks(3300);
      
      const charlieWithdraw = simnet.callPublicFn(
        "bitsave",
        "withdraw",
        [],
        charlie
      );
      expect(charlieWithdraw.result).toBeOk();
      
      // Aggressive user withdraws last (longest lock)
      simnet.mineEmptyBlocks(6000);
      
      const bobWithdraw = simnet.callPublicFn(
        "bitsave",
        "withdraw",
        [],
        bob
      );
      expect(bobWithdraw.result).toBeOk();
      
      // Bob should have highest rewards due to longer lock and time multiplier
      const bobWithdrawData = bobWithdraw.result.expectOk().expectTuple();
      expect(bobWithdrawData["earned-points"]).toBeInt();
    });

    it("should handle competitive savings scenario", () => {
      // Multiple users competing for highest reputation
      const competitors = [alice, bob, charlie];
      const rounds = 3;
      
      for (let round = 0; round < rounds; round++) {
        competitors.forEach((user, index) => {
          const amount = 5000000 + (index * 2000000); // Different amounts
          const period = 1000 + (round * 500); // Increasing periods
          
          const deposit = simnet.callPublicFn(
            "bitsave",
            "deposit",
            [Cl.uint(amount), Cl.uint(period)],
            user
          );
          expect(deposit.result).toBeOk();
        });
        
        // Wait for all to mature
        simnet.mineEmptyBlocks(1600 + (round * 500));
        
        // All withdraw
        competitors.forEach(user => {
          const withdraw = simnet.callPublicFn(
            "bitsave",
            "withdraw",
            [],
            user
          );
          expect(withdraw.result).toBeOk();
        });
        
        // Cooldown
        simnet.mineEmptyBlocks(150);
      }
      
      // Check final reputations
      const reputations = competitors.map(user => {
        const rep = simnet.callReadOnlyFn(
          "bitsave",
          "get-reputation",
          [Cl.principal(user)],
          deployer
        );
        return rep.result.expectOk().expectTuple();
      });
      
      // All should have built up reputation and streaks
      reputations.forEach(rep => {
        expect(rep["points"]).toBeInt();
        expect(rep["current-streak"]).toBeUint(rounds);
      });
    });
  });

  describe("Admin Management Scenarios", () => {
    it("should handle complete admin lifecycle", () => {
      // Admin monitors system
      const initialEvents = simnet.callReadOnlyFn(
        "bitsave",
        "get-contract-events",
        [Cl.uint(10)],
        deployer
      );
      expect(initialEvents.result).toBeOk();
      
      // Admin adjusts parameters based on usage
      const rateChange = simnet.callPublicFn(
        "bitsave",
        "set-reward-rate",
        [Cl.uint(15)], // Increase to 15%
        deployer
      );
      expect(rateChange.result).toBeOk();
      
      // Admin adjusts minimum deposit
      const minChange = simnet.callPublicFn(
        "bitsave",
        "set-minimum-deposit",
        [Cl.uint(2000000)], // Increase to 2 STX
        deployer
      );
      expect(minChange.result).toBeOk();
      
      // Users adapt to new parameters
      const userDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(3000000), Cl.uint(1000)], // Above new minimum
        alice
      );
      expect(userDeposit.result).toBeOk();
      
      // Admin handles emergency (pause contract)
      const pause = simnet.callPublicFn(
        "bitsave",
        "pause-contract",
        [],
        deployer
      );
      expect(pause.result).toBeOk();
      
      // New deposits should fail
      const blockedDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(5000000), Cl.uint(500)],
        bob
      );
      expect(blockedDeposit.result).toBeErr(Cl.uint(106)); // ERR_CONTRACT_PAUSED
      
      // Admin resolves emergency and unpauses
      const unpause = simnet.callPublicFn(
        "bitsave",
        "unpause-contract",
        [],
        deployer
      );
      expect(unpause.result).toBeOk();
      
      // System resumes normal operation
      const resumedDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(5000000), Cl.uint(500)],
        bob
      );
      expect(resumedDeposit.result).toBeOk();
      
      // Admin reviews final state
      const finalEvents = simnet.callReadOnlyFn(
        "bitsave",
        "get-contract-events",
        [Cl.uint(20)],
        deployer
      );
      expect(finalEvents.result).toBeOk();
      
      // Reset parameters
      simnet.callPublicFn("bitsave", "set-reward-rate", [Cl.uint(10)], deployer);
      simnet.callPublicFn("bitsave", "set-minimum-deposit", [Cl.uint(1000000)], deployer);
    });

    it("should handle rate history tracking scenario", () => {
      const rateChanges = [12, 8, 15, 20, 10]; // Various rate changes
      
      rateChanges.forEach(rate => {
        const rateChange = simnet.callPublicFn(
          "bitsave",
          "set-reward-rate",
          [Cl.uint(rate)],
          deployer
        );
        expect(rateChange.result).toBeOk();
        
        // Mine some blocks between changes
        simnet.mineEmptyBlocks(100);
      });
      
      // Check rate history
      const rateHistory = simnet.callReadOnlyFn(
        "bitsave",
        "get-rate-history",
        [Cl.uint(10)],
        deployer
      );
      expect(rateHistory.result).toBeOk();
      
      const historyData = rateHistory.result.expectOk().expectTuple();
      expect(historyData["total-changes"]).toBeUint(rateChanges.length);
      expect(historyData["current-rate"]).toBeUint(10); // Final rate
    });
  });

  describe("Badge System Integration Tests", () => {
    it("should handle badge earning progression", () => {
      // User builds up reputation to earn badge
      const depositsNeeded = 3; // Assuming each gives ~400 points
      
      for (let i = 0; i < depositsNeeded; i++) {
        const deposit = simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(10000000), Cl.uint(1000)], // 10 STX, good lock period
          alice
        );
        expect(deposit.result).toBeOk();
        
        simnet.mineEmptyBlocks(1100);
        
        const withdraw = simnet.callPublicFn(
          "bitsave",
          "withdraw",
          [],
          alice
        );
        expect(withdraw.result).toBeOk();
        
        // Check reputation progress
        const reputation = simnet.callReadOnlyFn(
          "bitsave",
          "get-reputation",
          [Cl.principal(alice)],
          alice
        );
        const repData = reputation.result.expectOk().expectTuple();
        
        if (i === depositsNeeded - 1) {
          // Should have enough points for badge (1000+)
          expect(repData["points"]).toBeInt();
        }
        
        simnet.mineEmptyBlocks(150); // Cooldown
      }
    });
  });

  describe("System Recovery Scenarios", () => {
    it("should handle system recovery after pause", () => {
      // Setup active users
      const users = [alice, bob, charlie];
      
      users.forEach(user => {
        simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(5000000), Cl.uint(2000)],
          user
        );
      });
      
      // System gets paused (emergency)
      simnet.callPublicFn("bitsave", "pause-contract", [], deployer);
      
      // Time passes while paused
      simnet.mineEmptyBlocks(1000);
      
      // System is unpaused
      simnet.callPublicFn("bitsave", "unpause-contract", [], deployer);
      
      // Users can still withdraw normally
      simnet.mineEmptyBlocks(1100);
      
      users.forEach(user => {
        const withdraw = simnet.callPublicFn(
          "bitsave",
          "withdraw",
          [],
          user
        );
        expect(withdraw.result).toBeOk();
      });
    });

    it("should handle parameter reset scenario", () => {
      // Admin makes various changes
      simnet.callPublicFn("bitsave", "set-reward-rate", [Cl.uint(50)], deployer);
      simnet.callPublicFn("bitsave", "set-minimum-deposit", [Cl.uint(5000000)], deployer);
      simnet.callPublicFn("bitsave", "set-early-withdrawal-penalty", [Cl.uint(50)], deployer);
      
      // User operates under new parameters
      const deposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(10000000), Cl.uint(1000)],
        alice
      );
      expect(deposit.result).toBeOk();
      
      // Admin resets to defaults
      simnet.callPublicFn("bitsave", "set-reward-rate", [Cl.uint(10)], deployer);
      simnet.callPublicFn("bitsave", "set-minimum-deposit", [Cl.uint(1000000)], deployer);
      simnet.callPublicFn("bitsave", "set-early-withdrawal-penalty", [Cl.uint(20)], deployer);
      
      // Existing user can still withdraw normally
      simnet.mineEmptyBlocks(1100);
      
      const withdraw = simnet.callPublicFn(
        "bitsave",
        "withdraw",
        [],
        alice
      );
      expect(withdraw.result).toBeOk();
      
      // New users operate under reset parameters
      const newDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(2000000), Cl.uint(500)],
        bob
      );
      expect(newDeposit.result).toBeOk();
    });
  });
});
