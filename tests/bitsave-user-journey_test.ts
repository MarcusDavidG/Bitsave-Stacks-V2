import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";
import { mockDataGenerator } from "./mock-data-generator";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;
const charlie = accounts.get("wallet_3")!;

describe("BitSave User Journey Test Flows", () => {
  beforeEach(() => {
    // Reset simnet state and mock data generator
    mockDataGenerator.resetSeed();
  });

  describe("New User Onboarding Flows", () => {
    it("should guide new user through complete onboarding", () => {
      // Step 1: New user discovers BitSave
      const contractStatus = simnet.callReadOnlyFn("bitsave", "is-paused", [], alice);
      expect(contractStatus.result).toBeOk(Cl.bool(false));
      
      // Step 2: User learns about requirements
      const minDeposit = simnet.callReadOnlyFn("bitsave", "get-minimum-deposit", [], alice);
      expect(minDeposit.result).toBeOk(Cl.uint(1000000));
      
      const rewardRate = simnet.callReadOnlyFn("bitsave", "get-reward-rate", [], alice);
      expect(rewardRate.result).toBeOk(Cl.uint(10));
      
      const penalty = simnet.callReadOnlyFn("bitsave", "get-early-withdrawal-penalty", [], alice);
      expect(penalty.result).toBeOk(Cl.uint(20));
      
      // Step 3: User checks if they have existing savings (should be none)
      const existingSavings = simnet.callReadOnlyFn("bitsave", "get-savings", [Cl.principal(alice)], alice);
      expect(existingSavings.result.expectOk()).toBeNone();
      
      // Step 4: User makes first deposit with conservative approach
      const firstDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit-with-goal",
        [
          Cl.uint(2000000), // 2 STX - conservative start
          Cl.uint(1000), // ~1 week lock
          Cl.uint(20000000), // Goal: 20 STX
          Cl.utf8("Emergency fund")
        ],
        alice
      );
      expect(firstDeposit.result).toBeOk();
      
      // Step 5: User checks their progress
      const savingsStatus = simnet.callReadOnlyFn("bitsave", "get-savings", [Cl.principal(alice)], alice);
      const savingsData = savingsStatus.result.expectOk().expectSome().expectTuple();
      expect(savingsData["amount"]).toBeUint(2000000);
      expect(savingsData["claimed"]).toBeBool(false);
      
      const goalProgress = simnet.callReadOnlyFn("bitsave", "get-savings-goal", [Cl.principal(alice)], alice);
      const goalData = goalProgress.result.expectOk().expectTuple();
      expect(goalData["progress-percent"]).toBeUint(10); // 2/20 = 10%
      
      // Step 6: User waits and learns about reputation
      simnet.mineEmptyBlocks(500);
      
      const currentReputation = simnet.callReadOnlyFn("bitsave", "get-reputation", [Cl.principal(alice)], alice);
      const repData = currentReputation.result.expectOk().expectTuple();
      expect(repData["current-streak"]).toBeUint(1); // First deposit creates streak
      
      // Step 7: User completes first cycle successfully
      simnet.mineEmptyBlocks(600);
      
      const firstWithdraw = simnet.callPublicFn("bitsave", "withdraw", [], alice);
      expect(firstWithdraw.result).toBeOk();
      
      const withdrawData = firstWithdraw.result.expectOk().expectTuple();
      expect(withdrawData["early-withdrawal"]).toBeBool(false);
      expect(withdrawData["earned-points"]).toBeInt();
      
      // Step 8: User sees reputation growth and is motivated to continue
      const finalReputation = simnet.callReadOnlyFn("bitsave", "get-reputation", [Cl.principal(alice)], alice);
      const finalRepData = finalReputation.result.expectOk().expectTuple();
      expect(finalRepData["current-streak"]).toBeUint(1);
      expect(finalRepData["longest-streak"]).toBeUint(1);
      expect(finalRepData["points"]).toBeInt();
    });

    it("should handle user making mistakes during onboarding", () => {
      // User tries to deposit too little
      const tooSmallDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(500000), Cl.uint(144)], // 0.5 STX - below minimum
        alice
      );
      expect(tooSmallDeposit.result).toBeErr(Cl.uint(107)); // ERR_BELOW_MINIMUM
      
      // User learns from error and deposits correct amount
      const correctDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(1500000), Cl.uint(500)], // 1.5 STX - above minimum
        alice
      );
      expect(correctDeposit.result).toBeOk();
      
      // User panics and tries to withdraw immediately (early withdrawal)
      simnet.mineEmptyBlocks(100); // Only partial way through lock
      
      const panicWithdraw = simnet.callPublicFn("bitsave", "withdraw", [], alice);
      expect(panicWithdraw.result).toBeOk();
      
      const withdrawData = panicWithdraw.result.expectOk().expectTuple();
      expect(withdrawData["early-withdrawal"]).toBeBool(true);
      expect(withdrawData["penalty"]).toBeUint(300000); // 20% of 1.5 STX
      expect(withdrawData["earned-points"]).toBeInt(0); // No points for early withdrawal
      
      // User learns about penalties and reputation impact
      const reputation = simnet.callReadOnlyFn("bitsave", "get-reputation", [Cl.principal(alice)], alice);
      const repData = reputation.result.expectOk().expectTuple();
      expect(repData["points"]).toBeInt(0); // No points earned
    });

    it("should guide user through goal-setting process", () => {
      // User starts without clear goals
      const initialDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(3000000), Cl.uint(1000)], // No goal specified
        alice
      );
      expect(initialDeposit.result).toBeOk();
      
      // User completes first cycle
      simnet.mineEmptyBlocks(1100);
      simnet.callPublicFn("bitsave", "withdraw", [], alice);
      simnet.mineEmptyBlocks(150);
      
      // User learns about goal setting and makes second deposit with goal
      const goalDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit-with-goal",
        [
          Cl.uint(5000000), // 5 STX
          Cl.uint(2000), // Longer commitment
          Cl.uint(100000000), // Goal: 100 STX
          Cl.utf8("House down payment")
        ],
        alice
      );
      expect(goalDeposit.result).toBeOk();
      
      // User tracks progress toward goal
      const goalProgress = simnet.callReadOnlyFn("bitsave", "get-savings-goal", [Cl.principal(alice)], alice);
      const goalData = goalProgress.result.expectOk().expectTuple();
      expect(goalData["goal-amount"]).toBeUint(100000000);
      expect(goalData["progress-percent"]).toBeUint(5); // 5/100 = 5%
      
      // User completes goal-oriented cycle
      simnet.mineEmptyBlocks(2100);
      
      const goalWithdraw = simnet.callPublicFn("bitsave", "withdraw", [], alice);
      expect(goalWithdraw.result).toBeOk();
      
      // User sees improved reputation from longer commitment
      const reputation = simnet.callReadOnlyFn("bitsave", "get-reputation", [Cl.principal(alice)], alice);
      const repData = reputation.result.expectOk().expectTuple();
      expect(repData["current-streak"]).toBeUint(2);
    });
  });

  describe("Experienced User Flows", () => {
    it("should handle experienced user optimization strategies", () => {
      // User has learned optimal strategies through experience
      const optimizationCycles = 5;
      
      for (let cycle = 0; cycle < optimizationCycles; cycle++) {
        // User optimizes amount and period based on experience
        const baseAmount = 5000000; // 5 STX base
        const amount = baseAmount + (cycle * 2000000); // Increasing amounts
        const period = 1000 + (cycle * 500); // Increasing lock periods for better multipliers
        
        const optimizedDeposit = simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(amount), Cl.uint(period)],
          alice
        );
        expect(optimizedDeposit.result).toBeOk();
        
        // User waits for optimal timing (full maturity)
        simnet.mineEmptyBlocks(period + 10);
        
        const optimizedWithdraw = simnet.callPublicFn("bitsave", "withdraw", [], alice);
        expect(optimizedWithdraw.result).toBeOk();
        
        const withdrawData = optimizedWithdraw.result.expectOk().expectTuple();
        expect(withdrawData["early-withdrawal"]).toBeBool(false);
        
        // Check reputation growth
        const reputation = simnet.callReadOnlyFn("bitsave", "get-reputation", [Cl.principal(alice)], alice);
        const repData = reputation.result.expectOk().expectTuple();
        expect(repData["current-streak"]).toBeUint(cycle + 1);
        
        // User understands streak bonuses and maintains them
        simnet.mineEmptyBlocks(150); // Minimal cooldown to maintain streak
      }
      
      // Experienced user should have high reputation
      const finalReputation = simnet.callReadOnlyFn("bitsave", "get-reputation", [Cl.principal(alice)], alice);
      const finalRepData = finalReputation.result.expectOk().expectTuple();
      expect(finalRepData["current-streak"]).toBeUint(optimizationCycles);
      expect(finalRepData["longest-streak"]).toBeUint(optimizationCycles);
    });

    it("should handle user adapting to market changes", () => {
      // Initial market conditions
      const initialRate = simnet.callReadOnlyFn("bitsave", "get-reward-rate", [], alice);
      expect(initialRate.result).toBeOk(Cl.uint(10));
      
      // User makes deposit under current conditions
      simnet.callPublicFn("bitsave", "deposit", [Cl.uint(10000000), Cl.uint(2000)], alice);
      
      // Market conditions change (admin increases rate)
      simnet.callPublicFn("bitsave", "set-reward-rate", [Cl.uint(20)], deployer);
      
      // User sees opportunity but can't deposit (already has active deposit)
      const blockedDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(5000000), Cl.uint(1000)],
        alice
      );
      expect(blockedDeposit.result).toBeErr(Cl.uint(101)); // ERR_ALREADY_DEPOSITED
      
      // User decides to wait for current deposit to mature
      simnet.mineEmptyBlocks(2100);
      
      const matureWithdraw = simnet.callPublicFn("bitsave", "withdraw", [], alice);
      expect(matureWithdraw.result).toBeOk();
      
      // User immediately re-deposits to take advantage of higher rate
      simnet.mineEmptyBlocks(150); // Cooldown
      
      const newRateDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(15000000), Cl.uint(3000)], // Larger deposit for higher rate
        alice
      );
      expect(newRateDeposit.result).toBeOk();
      
      // Market conditions change again (rate decreases)
      simnet.callPublicFn("bitsave", "set-reward-rate", [Cl.uint(8)], deployer);
      
      // User considers early withdrawal but decides to stick with commitment
      simnet.mineEmptyBlocks(3100);
      
      const finalWithdraw = simnet.callPublicFn("bitsave", "withdraw", [], alice);
      expect(finalWithdraw.result).toBeOk();
      
      // Reset rate
      simnet.callPublicFn("bitsave", "set-reward-rate", [Cl.uint(10)], deployer);
    });

    it("should handle user building toward badge milestones", () => {
      // User strategically builds reputation toward badge threshold (1000 points)
      const badgeStrategy = mockDataGenerator.generateReputationScenarios(1200);
      
      badgeStrategy.forEach((scenario, index) => {
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
        
        // Check if user has reached badge threshold
        const reputation = simnet.callReadOnlyFn("bitsave", "get-reputation", [Cl.principal(alice)], alice);
        const repData = reputation.result.expectOk().expectTuple();
        
        if (repData["points"].expectInt() >= 1000) {
          // User should have earned a badge (if badge system is connected)
          console.log(`User reached badge threshold at cycle ${index + 1}`);
          break;
        }
        
        simnet.mineEmptyBlocks(150); // Cooldown
      });
    });
  });

  describe("Crisis and Recovery Flows", () => {
    it("should handle user emergency withdrawal scenario", () => {
      // User makes planned long-term deposit
      const plannedDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit-with-goal",
        [
          Cl.uint(20000000), // 20 STX
          Cl.uint(10000), // Long-term lock
          Cl.uint(200000000), // Goal: 200 STX
          Cl.utf8("Retirement fund")
        ],
        alice
      );
      expect(plannedDeposit.result).toBeOk();
      
      // Emergency situation arises (user needs funds)
      simnet.mineEmptyBlocks(3000); // Only 30% through lock period
      
      // User checks penalty before withdrawing
      const penalty = simnet.callReadOnlyFn("bitsave", "get-early-withdrawal-penalty", [], alice);
      expect(penalty.result).toBeOk(Cl.uint(20)); // 20% penalty
      
      // User calculates they'll lose 4 STX but needs the funds
      const emergencyWithdraw = simnet.callPublicFn("bitsave", "withdraw", [], alice);
      expect(emergencyWithdraw.result).toBeOk();
      
      const withdrawData = emergencyWithdraw.result.expectOk().expectTuple();
      expect(withdrawData["early-withdrawal"]).toBeBool(true);
      expect(withdrawData["penalty"]).toBeUint(4000000); // 20% of 20 STX
      expect(withdrawData["withdrawn"]).toBeUint(16000000); // 80% of 20 STX
      expect(withdrawData["earned-points"]).toBeInt(0); // No reputation points
      
      // User's reputation is impacted (no streak progress)
      const reputation = simnet.callReadOnlyFn("bitsave", "get-reputation", [Cl.principal(alice)], alice);
      const repData = reputation.result.expectOk().expectTuple();
      expect(repData["points"]).toBeInt(0);
    });

    it("should handle user recovery after emergency", () => {
      // User had emergency withdrawal (setup)
      simnet.callPublicFn("bitsave", "deposit", [Cl.uint(10000000), Cl.uint(5000)], alice);
      simnet.mineEmptyBlocks(1000);
      simnet.callPublicFn("bitsave", "withdraw", [], alice); // Early withdrawal
      simnet.mineEmptyBlocks(150);
      
      // User recovers and wants to rebuild reputation
      const recoveryDeposit1 = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(3000000), Cl.uint(500)], // Smaller, safer deposit
        alice
      );
      expect(recoveryDeposit1.result).toBeOk();
      
      // User commits to full term to rebuild trust
      simnet.mineEmptyBlocks(600);
      
      const recoveryWithdraw1 = simnet.callPublicFn("bitsave", "withdraw", [], alice);
      expect(recoveryWithdraw1.result).toBeOk();
      
      const withdraw1Data = recoveryWithdraw1.result.expectOk().expectTuple();
      expect(withdraw1Data["early-withdrawal"]).toBeBool(false);
      
      // User gradually increases commitment
      simnet.mineEmptyBlocks(150);
      
      const recoveryDeposit2 = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(6000000), Cl.uint(1000)], // Larger deposit, longer term
        alice
      );
      expect(recoveryDeposit2.result).toBeOk();
      
      simnet.mineEmptyBlocks(1100);
      
      const recoveryWithdraw2 = simnet.callPublicFn("bitsave", "withdraw", [], alice);
      expect(recoveryWithdraw2.result).toBeOk();
      
      // User rebuilds reputation streak
      const finalReputation = simnet.callReadOnlyFn("bitsave", "get-reputation", [Cl.principal(alice)], alice);
      const finalRepData = finalReputation.result.expectOk().expectTuple();
      expect(finalRepData["current-streak"]).toBeUint(2);
    });

    it("should handle system pause during user deposit", () => {
      // User makes deposit
      const userDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(8000000), Cl.uint(2000)],
        alice
      );
      expect(userDeposit.result).toBeOk();
      
      // System gets paused for maintenance
      simnet.mineEmptyBlocks(1000);
      
      simnet.callPublicFn("bitsave", "pause-contract", [], deployer);
      
      // User tries to make another deposit (should fail)
      const blockedDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(2000000), Cl.uint(500)],
        bob
      );
      expect(blockedDeposit.result).toBeErr(Cl.uint(106)); // ERR_CONTRACT_PAUSED
      
      // User can still withdraw existing deposit
      simnet.mineEmptyBlocks(1100);
      
      const pausedWithdraw = simnet.callPublicFn("bitsave", "withdraw", [], alice);
      expect(pausedWithdraw.result).toBeOk();
      
      // System resumes
      simnet.callPublicFn("bitsave", "unpause-contract", [], deployer);
      
      // User can now make new deposits
      simnet.mineEmptyBlocks(150);
      
      const resumedDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(5000000), Cl.uint(1000)],
        alice
      );
      expect(resumedDeposit.result).toBeOk();
    });
  });

  describe("Advanced User Flows", () => {
    it("should handle power user with complex strategies", () => {
      // Power user understands all system mechanics
      const powerUserCycles = 8;
      
      for (let cycle = 0; cycle < powerUserCycles; cycle++) {
        // User varies strategy based on cycle
        let amount: number;
        let period: number;
        
        if (cycle < 3) {
          // Build initial reputation with moderate deposits
          amount = 5000000 + (cycle * 2000000);
          period = 1000 + (cycle * 300);
        } else if (cycle < 6) {
          // Optimize for time multipliers
          amount = 15000000 + (cycle * 3000000);
          period = 4320 + (cycle * 1000); // Target higher multiplier tiers
        } else {
          // Maximum optimization
          amount = 30000000 + (cycle * 5000000);
          period = 25920 + (cycle * 5000); // Long-term for maximum multipliers
        }
        
        const strategicDeposit = simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(amount), Cl.uint(period)],
          alice
        );
        expect(strategicDeposit.result).toBeOk();
        
        simnet.mineEmptyBlocks(period + 10);
        
        const strategicWithdraw = simnet.callPublicFn("bitsave", "withdraw", [], alice);
        expect(strategicWithdraw.result).toBeOk();
        
        const withdrawData = strategicWithdraw.result.expectOk().expectTuple();
        expect(withdrawData["early-withdrawal"]).toBeBool(false);
        
        // Power user maintains perfect streak
        const reputation = simnet.callReadOnlyFn("bitsave", "get-reputation", [Cl.principal(alice)], alice);
        const repData = reputation.result.expectOk().expectTuple();
        expect(repData["current-streak"]).toBeUint(cycle + 1);
        
        simnet.mineEmptyBlocks(150); // Minimal cooldown
      }
      
      // Power user should have very high reputation
      const finalReputation = simnet.callReadOnlyFn("bitsave", "get-reputation", [Cl.principal(alice)], alice);
      const finalRepData = finalReputation.result.expectOk().expectTuple();
      expect(finalRepData["current-streak"]).toBeUint(powerUserCycles);
      expect(finalRepData["longest-streak"]).toBeUint(powerUserCycles);
    });

    it("should handle user testing system limits", () => {
      // User tests minimum viable deposits
      const minDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(1000000), Cl.uint(1)], // Minimum amount, minimum period
        alice
      );
      expect(minDeposit.result).toBeOk();
      
      simnet.mineEmptyBlocks(5);
      simnet.callPublicFn("bitsave", "withdraw", [], alice);
      simnet.mineEmptyBlocks(150);
      
      // User tests maximum deposits
      const maxDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(99999999999999), Cl.uint(100000)], // Near maximum amount, long period
        alice
      );
      expect(maxDeposit.result).toBeOk();
      
      // User tests early withdrawal on large deposit
      simnet.mineEmptyBlocks(10000);
      
      const largeEarlyWithdraw = simnet.callPublicFn("bitsave", "withdraw", [], alice);
      expect(largeEarlyWithdraw.result).toBeOk();
      
      const withdrawData = largeEarlyWithdraw.result.expectOk().expectTuple();
      expect(withdrawData["early-withdrawal"]).toBeBool(true);
      expect(withdrawData["penalty"]).toBeUint(); // Should have large penalty
    });
  });

  describe("User Education and Learning Flows", () => {
    it("should demonstrate learning curve through user behavior", () => {
      // Novice behavior - small deposits, early withdrawals
      const noviceDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(1500000), Cl.uint(2000)], // 1.5 STX, ambitious lock
        alice
      );
      expect(noviceDeposit.result).toBeOk();
      
      // Novice gets impatient and withdraws early
      simnet.mineEmptyBlocks(500);
      
      const noviceWithdraw = simnet.callPublicFn("bitsave", "withdraw", [], alice);
      expect(noviceWithdraw.result).toBeOk();
      
      const noviceData = noviceWithdraw.result.expectOk().expectTuple();
      expect(noviceData["early-withdrawal"]).toBeBool(true);
      expect(noviceData["earned-points"]).toBeInt(0);
      
      // Learning phase - user adjusts strategy
      simnet.mineEmptyBlocks(150);
      
      const learningDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(2000000), Cl.uint(1000)], // Smaller lock period
        alice
      );
      expect(learningDeposit.result).toBeOk();
      
      // User waits for full maturity this time
      simnet.mineEmptyBlocks(1100);
      
      const learningWithdraw = simnet.callPublicFn("bitsave", "withdraw", [], alice);
      expect(learningWithdraw.result).toBeOk();
      
      const learningData = learningWithdraw.result.expectOk().expectTuple();
      expect(learningData["early-withdrawal"]).toBeBool(false);
      expect(learningData["earned-points"]).toBeInt();
      
      // Experienced behavior - optimized deposits
      simnet.mineEmptyBlocks(150);
      
      const experiencedDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(8000000), Cl.uint(4320)], // Larger amount, optimal period
        alice
      );
      expect(experiencedDeposit.result).toBeOk();
      
      simnet.mineEmptyBlocks(4420);
      
      const experiencedWithdraw = simnet.callPublicFn("bitsave", "withdraw", [], alice);
      expect(experiencedWithdraw.result).toBeOk();
      
      const experiencedData = experiencedWithdraw.result.expectOk().expectTuple();
      expect(experiencedData["early-withdrawal"]).toBeBool(false);
      
      // User should show progression in reputation
      const finalReputation = simnet.callReadOnlyFn("bitsave", "get-reputation", [Cl.principal(alice)], alice);
      const finalRepData = finalReputation.result.expectOk().expectTuple();
      expect(finalRepData["current-streak"]).toBeUint(2); // Only successful cycles count
    });
  });
});
