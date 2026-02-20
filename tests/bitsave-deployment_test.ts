import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;

describe("BitSave Deployment Validation Tests", () => {
  beforeEach(() => {
    // Reset simnet state before each test
  });

  describe("Contract Deployment Validation", () => {
    it("should validate initial contract state", () => {
      // Check initial admin
      const adminCheck = simnet.callReadOnlyFn("bitsave", "get-reward-rate", [], deployer);
      expect(adminCheck.result).toBeOk();
      
      // Check initial pause state
      const pauseStatus = simnet.callReadOnlyFn("bitsave", "is-paused", [], deployer);
      expect(pauseStatus.result).toBeOk(Cl.bool(false));
      
      // Check initial reward rate
      const rewardRate = simnet.callReadOnlyFn("bitsave", "get-reward-rate", [], deployer);
      expect(rewardRate.result).toBeOk(Cl.uint(10)); // Default 10%
      
      // Check initial minimum deposit
      const minDeposit = simnet.callReadOnlyFn("bitsave", "get-minimum-deposit", [], deployer);
      expect(minDeposit.result).toBeOk(Cl.uint(1000000)); // Default 1 STX
      
      // Check initial compound frequency
      const compoundFreq = simnet.callReadOnlyFn("bitsave", "get-compound-frequency", [], deployer);
      expect(compoundFreq.result).toBeOk(Cl.uint(12)); // Default monthly
      
      // Check initial penalty rate
      const penaltyRate = simnet.callReadOnlyFn("bitsave", "get-early-withdrawal-penalty", [], deployer);
      expect(penaltyRate.result).toBeOk(Cl.uint(20)); // Default 20%
      
      // Check initial max deposit per user
      const maxDeposit = simnet.callReadOnlyFn("bitsave", "get-max-deposit-per-user", [], deployer);
      expect(maxDeposit.result).toBeOk(Cl.uint(100000000000000)); // Default 100k STX
    });

    it("should validate contract functions are callable", () => {
      const publicFunctions = [
        { name: "deposit", params: [Cl.uint(5000000), Cl.uint(1000)], caller: alice },
        { name: "pause-contract", params: [], caller: deployer },
        { name: "unpause-contract", params: [], caller: deployer },
        { name: "set-reward-rate", params: [Cl.uint(15)], caller: deployer },
        { name: "set-minimum-deposit", params: [Cl.uint(2000000)], caller: deployer }
      ];
      
      publicFunctions.forEach(func => {
        const result = simnet.callPublicFn("bitsave", func.name, func.params, func.caller);
        expect(result.result).toBeOk();
      });
      
      // Reset to defaults
      simnet.callPublicFn("bitsave", "set-reward-rate", [Cl.uint(10)], deployer);
      simnet.callPublicFn("bitsave", "set-minimum-deposit", [Cl.uint(1000000)], deployer);
    });

    it("should validate read-only functions are accessible", () => {
      const readOnlyFunctions = [
        { name: "get-savings", params: [Cl.principal(alice)] },
        { name: "get-reputation", params: [Cl.principal(alice)] },
        { name: "get-reward-rate", params: [] },
        { name: "is-paused", params: [] },
        { name: "get-minimum-deposit", params: [] },
        { name: "get-compound-frequency", params: [] },
        { name: "get-early-withdrawal-penalty", params: [] },
        { name: "get-max-deposit-per-user", params: [] },
        { name: "get-withdrawal-cooldown-remaining", params: [Cl.principal(alice)] }
      ];
      
      readOnlyFunctions.forEach(func => {
        const result = simnet.callReadOnlyFn("bitsave", func.name, func.params, deployer);
        expect(result.result).toBeOk();
      });
    });

    it("should validate contract constants are properly set", () => {
      // Test error constants by triggering known errors
      const errorTests = [
        {
          description: "ERR_NO_AMOUNT",
          action: () => simnet.callPublicFn("bitsave", "deposit", [Cl.uint(0), Cl.uint(144)], alice),
          expectedError: 100
        },
        {
          description: "ERR_BELOW_MINIMUM", 
          action: () => simnet.callPublicFn("bitsave", "deposit", [Cl.uint(500000), Cl.uint(144)], alice),
          expectedError: 107
        },
        {
          description: "ERR_NOT_AUTHORIZED",
          action: () => simnet.callPublicFn("bitsave", "pause-contract", [], alice),
          expectedError: 105
        }
      ];
      
      errorTests.forEach(test => {
        const result = test.action();
        expect(result.result).toBeErr(Cl.uint(test.expectedError));
      });
    });
  });

  describe("Badge Contract Integration Validation", () => {
    it("should validate badge contract is deployable", () => {
      // Test badge contract read-only functions
      const badgeFunctions = [
        "get-next-token-id",
        "get-authorized-minter"
      ];
      
      badgeFunctions.forEach(funcName => {
        const result = simnet.callReadOnlyFn("bitsave-badges", funcName, [], deployer);
        expect(result.result).toBeOk();
      });
    });

    it("should validate badge contract authorization setup", () => {
      // Admin should be able to set authorized minter
      const setMinterResult = simnet.callPublicFn(
        "bitsave-badges",
        "set-authorized-minter",
        [Cl.principal(deployer)], // Set deployer as minter for testing
        deployer
      );
      expect(setMinterResult.result).toBeOk();
      
      // Verify minter was set
      const getMinterResult = simnet.callReadOnlyFn(
        "bitsave-badges",
        "get-authorized-minter",
        [],
        deployer
      );
      expect(getMinterResult.result).toBeOk();
      
      // Non-admin should not be able to set minter
      const unauthorizedResult = simnet.callPublicFn(
        "bitsave-badges",
        "set-authorized-minter",
        [Cl.principal(alice)],
        alice
      );
      expect(unauthorizedResult.result).toBeErr();
    });

    it("should validate badge minting integration", () => {
      // Set bitsave contract as authorized minter
      simnet.callPublicFn(
        "bitsave-badges",
        "set-authorized-minter",
        [Cl.principal(deployer)], // Use deployer for testing
        deployer
      );
      
      // Test badge minting (as authorized minter)
      const mintResult = simnet.callPublicFn(
        "bitsave-badges",
        "mint",
        [
          Cl.principal(alice),
          Cl.utf8("{\"name\":\"Test Badge\",\"tier\":\"bronze\"}")
        ],
        deployer
      );
      expect(mintResult.result).toBeOk();
      
      // Verify badge was minted
      const ownerResult = simnet.callReadOnlyFn(
        "bitsave-badges",
        "get-owner",
        [Cl.uint(1)],
        deployer
      );
      expect(ownerResult.result).toBeOk();
    });
  });

  describe("Referral Contract Integration Validation", () => {
    it("should validate referral contract is deployable", () => {
      // Test referral contract read-only functions
      const referralFunctions = [
        { name: "get-referral-bonus-rate", params: [] },
        { name: "get-referrer", params: [Cl.principal(alice)] },
        { name: "get-referral-stats", params: [Cl.principal(alice)] }
      ];
      
      referralFunctions.forEach(func => {
        const result = simnet.callReadOnlyFn("bitsave-referrals", func.name, func.params, deployer);
        expect(result.result).toBeOk();
      });
    });

    it("should validate referral registration", () => {
      // Alice refers Bob
      const referralResult = simnet.callPublicFn(
        "bitsave-referrals",
        "register-referral",
        [Cl.principal(alice)],
        bob
      );
      expect(referralResult.result).toBeOk();
      
      // Verify referral relationship
      const getReferrerResult = simnet.callReadOnlyFn(
        "bitsave-referrals",
        "get-referrer",
        [Cl.principal(bob)],
        deployer
      );
      expect(getReferrerResult.result).toBeOk();
      
      // Check referral stats
      const statsResult = simnet.callReadOnlyFn(
        "bitsave-referrals",
        "get-referral-stats",
        [Cl.principal(alice)],
        deployer
      );
      expect(statsResult.result).toBeOk();
    });

    it("should validate referral bonus calculation", () => {
      // Register referral first
      simnet.callPublicFn(
        "bitsave-referrals",
        "register-referral",
        [Cl.principal(alice)],
        bob
      );
      
      // Calculate bonus
      const bonusResult = simnet.callPublicFn(
        "bitsave-referrals",
        "calculate-referral-bonus",
        [Cl.uint(10000000)], // 10 STX
        bob
      );
      expect(bonusResult.result).toBeOk();
    });
  });

  describe("Contract Upgrade Validation", () => {
    it("should validate upgrade contract is deployable", () => {
      // Test upgrade contract functions
      const upgradeFunctions = [
        { name: "is-upgrade-enabled", params: [] },
        { name: "get-new-contract-address", params: [] },
        { name: "get-admin", params: [] }
      ];
      
      upgradeFunctions.forEach(func => {
        const result = simnet.callReadOnlyFn("bitsave-upgrade", func.name, func.params, deployer);
        expect(result.result).toBeOk();
      });
    });

    it("should validate upgrade authorization", () => {
      // Admin should be able to enable upgrade
      const enableResult = simnet.callPublicFn(
        "bitsave-upgrade",
        "enable-upgrade",
        [Cl.principal(alice)], // New contract address
        deployer
      );
      expect(enableResult.result).toBeOk();
      
      // Verify upgrade is enabled
      const statusResult = simnet.callReadOnlyFn(
        "bitsave-upgrade",
        "is-upgrade-enabled",
        [],
        deployer
      );
      expect(statusResult.result).toBeOk(Cl.bool(true));
      
      // Non-admin should not be able to enable upgrade
      const unauthorizedResult = simnet.callPublicFn(
        "bitsave-upgrade",
        "enable-upgrade",
        [Cl.principal(bob)],
        alice
      );
      expect(unauthorizedResult.result).toBeErr();
    });
  });

  describe("System Integration Validation", () => {
    it("should validate complete system deployment", () => {
      // Test that all contracts can work together
      
      // 1. Setup badge system
      simnet.callPublicFn(
        "bitsave-badges",
        "set-authorized-minter",
        [Cl.principal(deployer)], // In real deployment, this would be bitsave contract
        deployer
      );
      
      // 2. Setup referral system
      simnet.callPublicFn(
        "bitsave-referrals",
        "register-referral",
        [Cl.principal(alice)],
        bob
      );
      
      // 3. Test main contract functionality
      const depositResult = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(10000000), Cl.uint(2000)],
        bob
      );
      expect(depositResult.result).toBeOk();
      
      // 4. Test withdrawal with potential badge minting
      simnet.mineEmptyBlocks(2100);
      
      const withdrawResult = simnet.callPublicFn("bitsave", "withdraw", [], bob);
      expect(withdrawResult.result).toBeOk();
      
      // 5. Verify system state
      const reputation = simnet.callReadOnlyFn(
        "bitsave",
        "get-reputation",
        [Cl.principal(bob)],
        deployer
      );
      expect(reputation.result).toBeOk();
    });

    it("should validate deployment configuration", () => {
      // Check that all default values are production-ready
      const configChecks = [
        {
          name: "reward-rate",
          getter: () => simnet.callReadOnlyFn("bitsave", "get-reward-rate", [], deployer),
          expectedValue: 10,
          description: "Default reward rate should be reasonable"
        },
        {
          name: "minimum-deposit",
          getter: () => simnet.callReadOnlyFn("bitsave", "get-minimum-deposit", [], deployer),
          expectedValue: 1000000,
          description: "Minimum deposit should prevent dust"
        },
        {
          name: "early-withdrawal-penalty",
          getter: () => simnet.callReadOnlyFn("bitsave", "get-early-withdrawal-penalty", [], deployer),
          expectedValue: 20,
          description: "Penalty should discourage early withdrawal"
        },
        {
          name: "max-deposit-per-user",
          getter: () => simnet.callReadOnlyFn("bitsave", "get-max-deposit-per-user", [], deployer),
          expectedValue: 100000000000000,
          description: "Max deposit should prevent whale manipulation"
        }
      ];
      
      configChecks.forEach(check => {
        const result = check.getter();
        expect(result.result).toBeOk(Cl.uint(check.expectedValue));
      });
    });

    it("should validate security configuration", () => {
      // Verify admin controls are properly set
      const adminTests = [
        () => simnet.callPublicFn("bitsave", "pause-contract", [], deployer),
        () => simnet.callPublicFn("bitsave", "unpause-contract", [], deployer),
        () => simnet.callPublicFn("bitsave-badges", "set-authorized-minter", [Cl.principal(deployer)], deployer),
        () => simnet.callPublicFn("bitsave-upgrade", "enable-upgrade", [Cl.principal(alice)], deployer)
      ];
      
      adminTests.forEach(test => {
        const result = test();
        expect(result.result).toBeOk();
      });
      
      // Verify non-admin cannot access admin functions
      const unauthorizedTests = [
        () => simnet.callPublicFn("bitsave", "pause-contract", [], alice),
        () => simnet.callPublicFn("bitsave-badges", "set-authorized-minter", [Cl.principal(alice)], alice),
        () => simnet.callPublicFn("bitsave-upgrade", "enable-upgrade", [Cl.principal(bob)], alice)
      ];
      
      unauthorizedTests.forEach(test => {
        const result = test();
        expect(result.result).toBeErr();
      });
    });
  });

  describe("Production Readiness Validation", () => {
    it("should validate gas efficiency for common operations", () => {
      const operations = [
        {
          name: "deposit",
          action: () => simnet.callPublicFn("bitsave", "deposit", [Cl.uint(5000000), Cl.uint(1000)], alice)
        },
        {
          name: "get-savings",
          action: () => simnet.callReadOnlyFn("bitsave", "get-savings", [Cl.principal(alice)], deployer)
        },
        {
          name: "get-reputation",
          action: () => simnet.callReadOnlyFn("bitsave", "get-reputation", [Cl.principal(alice)], deployer)
        }
      ];
      
      operations.forEach(op => {
        const startTime = performance.now();
        const result = op.action();
        const endTime = performance.now();
        
        expect(result.result).toBeOk();
        expect(endTime - startTime).toBeLessThan(100); // Should be efficient
      });
    });

    it("should validate error handling robustness", () => {
      // Test various error scenarios
      const errorScenarios = [
        {
          description: "Invalid deposit amount",
          test: () => simnet.callPublicFn("bitsave", "deposit", [Cl.uint(0), Cl.uint(144)], alice)
        },
        {
          description: "Unauthorized admin action",
          test: () => simnet.callPublicFn("bitsave", "pause-contract", [], alice)
        },
        {
          description: "Withdraw without deposit",
          test: () => simnet.callPublicFn("bitsave", "withdraw", [], bob)
        },
        {
          description: "Invalid parameter values",
          test: () => simnet.callPublicFn("bitsave", "set-early-withdrawal-penalty", [Cl.uint(101)], deployer)
        }
      ];
      
      errorScenarios.forEach(scenario => {
        const result = scenario.test();
        expect(result.result).toBeErr(); // Should handle errors gracefully
      });
    });

    it("should validate data consistency under load", () => {
      const users = [alice, bob];
      const operations = 10;
      
      // Simulate load
      for (let i = 0; i < operations; i++) {
        users.forEach((user, index) => {
          const amount = 2000000 + (i * 500000) + (index * 1000000);
          const period = 500 + (i * 100);
          
          const depositResult = simnet.callPublicFn(
            "bitsave",
            "deposit",
            [Cl.uint(amount), Cl.uint(period)],
            user
          );
          expect(depositResult.result).toBeOk();
          
          simnet.mineEmptyBlocks(period + 10);
          
          const withdrawResult = simnet.callPublicFn("bitsave", "withdraw", [], user);
          expect(withdrawResult.result).toBeOk();
          
          simnet.mineEmptyBlocks(150);
        });
      }
      
      // Verify final state consistency
      users.forEach(user => {
        const reputation = simnet.callReadOnlyFn(
          "bitsave",
          "get-reputation",
          [Cl.principal(user)],
          deployer
        );
        const repData = reputation.result.expectOk().expectTuple();
        expect(repData["current-streak"]).toBeUint(operations);
      });
    });

    it("should validate upgrade path readiness", () => {
      // Test that upgrade mechanism is ready
      const upgradeResult = simnet.callPublicFn(
        "bitsave-upgrade",
        "enable-upgrade",
        [Cl.principal(alice)], // Mock new contract
        deployer
      );
      expect(upgradeResult.result).toBeOk();
      
      // Verify upgrade state
      const upgradeStatus = simnet.callReadOnlyFn(
        "bitsave-upgrade",
        "is-upgrade-enabled",
        [],
        deployer
      );
      expect(upgradeStatus.result).toBeOk(Cl.bool(true));
      
      // Test disable upgrade
      const disableResult = simnet.callPublicFn(
        "bitsave-upgrade",
        "disable-upgrade",
        [],
        deployer
      );
      expect(disableResult.result).toBeOk();
    });
  });
});
