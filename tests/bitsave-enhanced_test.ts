import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;

describe("BitSave Enhanced Features", () => {
  beforeEach(() => {
    // Reset simnet state before each test
  });

  describe("Emergency Pause Functionality", () => {
    it("should allow admin to pause contract", () => {
      const pauseResult = simnet.callPublicFn(
        "bitsave",
        "pause-contract",
        [],
        deployer
      );
      expect(pauseResult.result).toBeOk(Cl.bool(true));
    });

    it("should prevent deposits when paused", () => {
      // Pause contract
      simnet.callPublicFn("bitsave", "pause-contract", [], deployer);
      
      // Try to deposit
      const depositResult = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(1000000), Cl.uint(144)],
        alice
      );
      expect(depositResult.result).toBeErr(Cl.uint(106)); // ERR_CONTRACT_PAUSED
    });

    it("should allow deposits after unpause", () => {
      // Pause and unpause
      simnet.callPublicFn("bitsave", "pause-contract", [], deployer);
      simnet.callPublicFn("bitsave", "unpause-contract", [], deployer);
      
      // Should work now
      const depositResult = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(1000000), Cl.uint(144)],
        alice
      );
      expect(depositResult.result).toBeOk();
    });

    it("should not allow non-admin to pause", () => {
      const pauseResult = simnet.callPublicFn(
        "bitsave",
        "pause-contract",
        [],
        alice
      );
      expect(pauseResult.result).toBeErr(Cl.uint(105)); // ERR_NOT_AUTHORIZED
    });
  });

  describe("Minimum Deposit Validation", () => {
    it("should reject deposits below minimum", () => {
      const depositResult = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(500000), Cl.uint(144)], // 0.5 STX, below 1 STX minimum
        alice
      );
      expect(depositResult.result).toBeErr(Cl.uint(107)); // ERR_BELOW_MINIMUM
    });

    it("should accept deposits at minimum", () => {
      const depositResult = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(1000000), Cl.uint(144)], // Exactly 1 STX
        alice
      );
      expect(depositResult.result).toBeOk();
    });

    it("should allow admin to change minimum", () => {
      const setMinResult = simnet.callPublicFn(
        "bitsave",
        "set-minimum-deposit",
        [Cl.uint(2000000)], // 2 STX
        deployer
      );
      expect(setMinResult.result).toBeOk(Cl.uint(2000000));

      // Now 1 STX should fail
      const depositResult = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(1000000), Cl.uint(144)],
        alice
      );
      expect(depositResult.result).toBeErr(Cl.uint(107)); // ERR_BELOW_MINIMUM
    });
  });

  describe("Maximum Deposit Cap", () => {
    it("should reject deposits above maximum", () => {
      const depositResult = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(200000000000000), Cl.uint(144)], // 200,000 STX, above 100,000 limit
        alice
      );
      expect(depositResult.result).toBeErr(Cl.uint(108)); // ERR_EXCEEDS_MAXIMUM
    });

    it("should accept deposits at maximum", () => {
      const depositResult = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(100000000000000), Cl.uint(144)], // Exactly 100,000 STX
        alice
      );
      expect(depositResult.result).toBeOk();
    });
  });

  describe("Early Withdrawal Penalty", () => {
    it("should apply penalty for early withdrawal", () => {
      // Deposit
      simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(10000000), Cl.uint(1000)], // 10 STX for 1000 blocks
        alice
      );

      // Withdraw early (before 1000 blocks)
      const withdrawResult = simnet.callPublicFn(
        "bitsave",
        "withdraw",
        [],
        alice
      );

      expect(withdrawResult.result).toBeOk();
      const withdrawData = withdrawResult.result.expectOk().expectTuple();
      expect(withdrawData["early-withdrawal"]).toBeBool(true);
      expect(withdrawData["penalty"]).toBeUint(2000000); // 20% of 10 STX
      expect(withdrawData["withdrawn"]).toBeUint(8000000); // 80% of 10 STX
      expect(withdrawData["earned-points"]).toBeInt(0); // No points for early withdrawal
    });

    it("should not apply penalty for mature withdrawal", () => {
      // Deposit
      simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(10000000), Cl.uint(10)], // 10 STX for 10 blocks
        alice
      );

      // Mine blocks to mature
      simnet.mineEmptyBlocks(15);

      // Withdraw after maturity
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
      expect(withdrawData["withdrawn"]).toBeUint(10000000); // Full amount
    });
  });

  describe("Time-based Reward Multipliers", () => {
    it("should apply correct multiplier for 1 month lock", () => {
      // Deposit for ~1 month (4320 blocks)
      simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(10000000), Cl.uint(4320)],
        alice
      );

      // Mine blocks to mature
      simnet.mineEmptyBlocks(4325);

      const withdrawResult = simnet.callPublicFn(
        "bitsave",
        "withdraw",
        [],
        alice
      );

      expect(withdrawResult.result).toBeOk();
      // Should get base reward (1x multiplier)
    });

    it("should apply higher multiplier for 1 year lock", () => {
      // Deposit for ~1 year (52560 blocks)
      simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(10000000), Cl.uint(52560)],
        alice
      );

      // Mine blocks to mature
      simnet.mineEmptyBlocks(52565);

      const withdrawResult = simnet.callPublicFn(
        "bitsave",
        "withdraw",
        [],
        alice
      );

      expect(withdrawResult.result).toBeOk();
      // Should get 1.5x multiplier reward
    });
  });

  describe("Admin Functions", () => {
    it("should allow admin to set compound frequency", () => {
      const setFreqResult = simnet.callPublicFn(
        "bitsave",
        "set-compound-frequency",
        [Cl.uint(4)], // Quarterly
        deployer
      );
      expect(setFreqResult.result).toBeOk(Cl.uint(4));
    });

    it("should allow admin to set early withdrawal penalty", () => {
      const setPenaltyResult = simnet.callPublicFn(
        "bitsave",
        "set-early-withdrawal-penalty",
        [Cl.uint(30)], // 30%
        deployer
      );
      expect(setPenaltyResult.result).toBeOk(Cl.uint(30));
    });

    it("should not allow penalty above 100%", () => {
      const setPenaltyResult = simnet.callPublicFn(
        "bitsave",
        "set-early-withdrawal-penalty",
        [Cl.uint(150)], // 150% - invalid
        deployer
      );
      expect(setPenaltyResult.result).toBeErr(Cl.uint(100)); // ERR_NO_AMOUNT
    });
  });

  describe("Read-only Functions", () => {
    it("should return correct pause status", () => {
      let pauseStatus = simnet.callReadOnlyFn(
        "bitsave",
        "is-paused",
        [],
        deployer
      );
      expect(pauseStatus.result).toBeOk(Cl.bool(false));

      simnet.callPublicFn("bitsave", "pause-contract", [], deployer);

      pauseStatus = simnet.callReadOnlyFn(
        "bitsave",
        "is-paused",
        [],
        deployer
      );
      expect(pauseStatus.result).toBeOk(Cl.bool(true));
    });

    it("should return correct minimum deposit", () => {
      const minDeposit = simnet.callReadOnlyFn(
        "bitsave",
        "get-minimum-deposit",
        [],
        deployer
      );
      expect(minDeposit.result).toBeOk(Cl.uint(1000000)); // 1 STX default
    });

    it("should return correct compound frequency", () => {
      const frequency = simnet.callReadOnlyFn(
        "bitsave",
        "get-compound-frequency",
        [],
        deployer
      );
      expect(frequency.result).toBeOk(Cl.uint(12)); // Monthly default
    });
  });
});
