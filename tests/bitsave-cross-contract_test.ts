import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;
const charlie = accounts.get("wallet_3")!;

describe("BitSave Cross-Contract Interaction Tests", () => {
  beforeEach(() => {
    // Reset simnet state before each test
  });

  describe("BitSave-Badge Integration", () => {
    it("should handle badge minting integration", () => {
      // Setup badge system authorization
      const authResult = simnet.callPublicFn(
        "bitsave-badges",
        "set-authorized-minter",
        [Cl.principal(deployer)], // In production, this would be the bitsave contract
        deployer
      );
      expect(authResult.result).toBeOk();
      
      // User builds reputation through multiple cycles
      const reputationCycles = 3;
      
      for (let cycle = 0; cycle < reputationCycles; cycle++) {
        const amount = 10000000 + (cycle * 5000000); // Increasing amounts
        const period = 1000 + (cycle * 500); // Increasing periods
        
        const depositResult = simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(amount), Cl.uint(period)],
          alice
        );
        expect(depositResult.result).toBeOk();
        
        simnet.mineEmptyBlocks(period + 10);
        
        const withdrawResult = simnet.callPublicFn("bitsave", "withdraw", [], alice);
        expect(withdrawResult.result).toBeOk();
        
        // Check reputation growth
        const reputation = simnet.callReadOnlyFn(
          "bitsave",
          "get-reputation",
          [Cl.principal(alice)],
          deployer
        );
        const repData = reputation.result.expectOk().expectTuple();
        expect(repData["current-streak"]).toBeUint(cycle + 1);
        
        simnet.mineEmptyBlocks(150); // Cooldown
      }
      
      // Check if user has enough reputation for badge (1000+ points)
      const finalReputation = simnet.callReadOnlyFn(
        "bitsave",
        "get-reputation",
        [Cl.principal(alice)],
        deployer
      );
      const finalRepData = finalReputation.result.expectOk().expectTuple();
      
      // If user has enough reputation, manually mint badge (simulating auto-mint)
      if (finalRepData["points"].expectInt() >= 1000) {
        const badgeResult = simnet.callPublicFn(
          "bitsave-badges",
          "mint",
          [
            Cl.principal(alice),
            Cl.utf8('{"name":"Loyal Saver","tier":"gold","threshold":1000}')
          ],
          deployer
        );
        expect(badgeResult.result).toBeOk();
        
        // Verify badge ownership
        const ownerResult = simnet.callReadOnlyFn(
          "bitsave-badges",
          "get-owner",
          [Cl.uint(1)],
          deployer
        );
        expect(ownerResult.result).toBeOk(Cl.some(Cl.principal(alice)));
      }
    });

    it("should handle badge transfer scenarios", () => {
      // Setup and mint badge
      simnet.callPublicFn("bitsave-badges", "set-authorized-minter", [Cl.principal(deployer)], deployer);
      
      const mintResult = simnet.callPublicFn(
        "bitsave-badges",
        "mint",
        [
          Cl.principal(alice),
          Cl.utf8('{"name":"Achievement Badge","tier":"silver"}')
        ],
        deployer
      );
      expect(mintResult.result).toBeOk();
      
      // Alice transfers badge to Bob
      const transferResult = simnet.callPublicFn(
        "bitsave-badges",
        "transfer",
        [Cl.uint(1), Cl.principal(alice), Cl.principal(bob)],
        alice
      );
      expect(transferResult.result).toBeOk();
      
      // Verify new ownership
      const newOwnerResult = simnet.callReadOnlyFn(
        "bitsave-badges",
        "get-owner",
        [Cl.uint(1)],
        deployer
      );
      expect(newOwnerResult.result).toBeOk(Cl.some(Cl.principal(bob)));
      
      // Bob can burn the badge
      const burnResult = simnet.callPublicFn(
        "bitsave-badges",
        "burn",
        [Cl.uint(1)],
        bob
      );
      expect(burnResult.result).toBeOk();
      
      // Badge should no longer have owner
      const burnedOwnerResult = simnet.callReadOnlyFn(
        "bitsave-badges",
        "get-owner",
        [Cl.uint(1)],
        deployer
      );
      expect(burnedOwnerResult.result).toBeOk(Cl.none());
    });

    it("should handle multiple badge tiers", () => {
      // Setup badge system
      simnet.callPublicFn("bitsave-badges", "set-authorized-minter", [Cl.principal(deployer)], deployer);
      
      const badgeTiers = [
        { name: "Bronze Saver", tier: "bronze", threshold: 100 },
        { name: "Silver Saver", tier: "silver", threshold: 500 },
        { name: "Gold Saver", tier: "gold", threshold: 1000 },
        { name: "Platinum Saver", tier: "platinum", threshold: 5000 }
      ];
      
      const users = [alice, bob, charlie, deployer];
      
      // Mint different tier badges for different users
      badgeTiers.forEach((badge, index) => {
        const user = users[index];
        const metadata = JSON.stringify({
          name: badge.name,
          tier: badge.tier,
          threshold: badge.threshold
        });
        
        const mintResult = simnet.callPublicFn(
          "bitsave-badges",
          "mint",
          [Cl.principal(user), Cl.utf8(metadata)],
          deployer
        );
        expect(mintResult.result).toBeOk();
        
        // Verify badge metadata
        const tokenUriResult = simnet.callReadOnlyFn(
          "bitsave-badges",
          "get-token-uri",
          [Cl.uint(index + 1)],
          deployer
        );
        expect(tokenUriResult.result).toBeOk(Cl.some(Cl.utf8(metadata)));
      });
      
      // Verify next token ID
      const nextIdResult = simnet.callReadOnlyFn(
        "bitsave-badges",
        "get-next-token-id",
        [],
        deployer
      );
      expect(nextIdResult.result).toBeOk(Cl.uint(5)); // Should be 5 (next after 1,2,3,4)
    });
  });

  describe("BitSave-Referral Integration", () => {
    it("should handle referral registration and tracking", () => {
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
      expect(getReferrerResult.result).toBeOk(Cl.some(Cl.principal(alice)));
      
      // Check Alice's referral stats
      const statsResult = simnet.callReadOnlyFn(
        "bitsave-referrals",
        "get-referral-stats",
        [Cl.principal(alice)],
        deployer
      );
      expect(statsResult.result).toBeOk();
      
      const statsData = statsResult.result.expectOk().expectSome().expectTuple();
      expect(statsData["total-referrals"]).toBeUint(1);
      expect(statsData["active-referrals"]).toBeUint(1);
      
      // Bob makes deposit (referred user activity)
      const bobDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(5000000), Cl.uint(1000)],
        bob
      );
      expect(bobDeposit.result).toBeOk();
      
      // Calculate referral bonus for Bob's deposit
      const bonusResult = simnet.callPublicFn(
        "bitsave-referrals",
        "calculate-referral-bonus",
        [Cl.uint(5000000)],
        bob
      );
      expect(bonusResult.result).toBeOk();
    });

    it("should handle referral bonus rate changes", () => {
      // Setup referral
      simnet.callPublicFn("bitsave-referrals", "register-referral", [Cl.principal(alice)], bob);
      
      // Check initial bonus rate
      const initialRate = simnet.callReadOnlyFn(
        "bitsave-referrals",
        "get-referral-bonus-rate",
        [],
        deployer
      );
      expect(initialRate.result).toBeOk(Cl.uint(5)); // Default 5%
      
      // Calculate bonus with initial rate
      const initialBonus = simnet.callPublicFn(
        "bitsave-referrals",
        "calculate-referral-bonus",
        [Cl.uint(10000000)], // 10 STX
        bob
      );
      expect(initialBonus.result).toBeOk();
      
      // Admin changes bonus rate
      const rateChangeResult = simnet.callPublicFn(
        "bitsave-referrals",
        "set-referral-bonus-rate",
        [Cl.uint(10)], // 10%
        deployer
      );
      expect(rateChangeResult.result).toBeOk();
      
      // Calculate bonus with new rate
      const newBonus = simnet.callPublicFn(
        "bitsave-referrals",
        "calculate-referral-bonus",
        [Cl.uint(10000000)], // 10 STX
        bob
      );
      expect(newBonus.result).toBeOk();
      
      // Reset rate
      simnet.callPublicFn("bitsave-referrals", "set-referral-bonus-rate", [Cl.uint(5)], deployer);
    });

    it("should prevent referral abuse", () => {
      // User cannot refer themselves
      const selfReferralResult = simnet.callPublicFn(
        "bitsave-referrals",
        "register-referral",
        [Cl.principal(alice)],
        alice
      );
      expect(selfReferralResult.result).toBeErr(Cl.uint(302)); // ERR_SELF_REFERRAL
      
      // User cannot be referred twice
      simnet.callPublicFn("bitsave-referrals", "register-referral", [Cl.principal(alice)], bob);
      
      const doubleReferralResult = simnet.callPublicFn(
        "bitsave-referrals",
        "register-referral",
        [Cl.principal(charlie)],
        bob
      );
      expect(doubleReferralResult.result).toBeErr(Cl.uint(301)); // ERR_ALREADY_REFERRED
    });
  });

  describe("BitSave-Upgrade Integration", () => {
    it("should handle upgrade preparation", () => {
      // Setup active system
      const users = [alice, bob, charlie];
      
      users.forEach(user => {
        simnet.callPublicFn("bitsave", "deposit", [Cl.uint(5000000), Cl.uint(1500)], user);
      });
      
      // Admin prepares for upgrade
      const upgradeResult = simnet.callPublicFn(
        "bitsave-upgrade",
        "enable-upgrade",
        [Cl.principal(deployer)], // Mock new contract address
        deployer
      );
      expect(upgradeResult.result).toBeOk();
      
      // Verify upgrade status
      const upgradeStatus = simnet.callReadOnlyFn(
        "bitsave-upgrade",
        "is-upgrade-enabled",
        [],
        deployer
      );
      expect(upgradeStatus.result).toBeOk(Cl.bool(true));
      
      // Get new contract address
      const newContractResult = simnet.callReadOnlyFn(
        "bitsave-upgrade",
        "get-new-contract-address",
        [],
        deployer
      );
      expect(newContractResult.result).toBeOk(Cl.some(Cl.principal(deployer)));
      
      // Users should still be able to withdraw before upgrade
      simnet.mineEmptyBlocks(1600);
      
      users.forEach(user => {
        const withdrawResult = simnet.callPublicFn("bitsave", "withdraw", [], user);
        expect(withdrawResult.result).toBeOk();
      });
      
      // Disable upgrade after testing
      simnet.callPublicFn("bitsave-upgrade", "disable-upgrade", [], deployer);
    });

    it("should handle admin transfer in upgrade contract", () => {
      // Check initial admin
      const initialAdmin = simnet.callReadOnlyFn(
        "bitsave-upgrade",
        "get-admin",
        [],
        deployer
      );
      expect(initialAdmin.result).toBeOk(Cl.principal(deployer));
      
      // Transfer admin to Alice
      const transferResult = simnet.callPublicFn(
        "bitsave-upgrade",
        "transfer-admin",
        [Cl.principal(alice)],
        deployer
      );
      expect(transferResult.result).toBeOk();
      
      // Verify new admin
      const newAdmin = simnet.callReadOnlyFn(
        "bitsave-upgrade",
        "get-admin",
        [],
        deployer
      );
      expect(newAdmin.result).toBeOk(Cl.principal(alice));
      
      // Old admin should not be able to enable upgrade
      const unauthorizedUpgrade = simnet.callPublicFn(
        "bitsave-upgrade",
        "enable-upgrade",
        [Cl.principal(bob)],
        deployer
      );
      expect(unauthorizedUpgrade.result).toBeErr(Cl.uint(200)); // ERR_NOT_AUTHORIZED
      
      // New admin should be able to enable upgrade
      const authorizedUpgrade = simnet.callPublicFn(
        "bitsave-upgrade",
        "enable-upgrade",
        [Cl.principal(bob)],
        alice
      );
      expect(authorizedUpgrade.result).toBeOk();
      
      // Transfer admin back
      simnet.callPublicFn("bitsave-upgrade", "transfer-admin", [Cl.principal(deployer)], alice);
    });
  });

  describe("Multi-Contract Coordination", () => {
    it("should handle coordinated system setup", () => {
      // Setup complete system coordination
      
      // 1. Setup badge system
      const badgeSetup = simnet.callPublicFn(
        "bitsave-badges",
        "set-authorized-minter",
        [Cl.principal(deployer)], // In production: bitsave contract
        deployer
      );
      expect(badgeSetup.result).toBeOk();
      
      // 2. Setup referral relationships
      const referralSetup = simnet.callPublicFn(
        "bitsave-referrals",
        "register-referral",
        [Cl.principal(alice)],
        bob
      );
      expect(referralSetup.result).toBeOk();
      
      // 3. Setup upgrade readiness
      const upgradeSetup = simnet.callPublicFn(
        "bitsave-upgrade",
        "enable-upgrade",
        [Cl.principal(charlie)],
        deployer
      );
      expect(upgradeSetup.result).toBeOk();
      
      // 4. Test coordinated user activity
      const bobDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(15000000), Cl.uint(2000)], // Large deposit for badge eligibility
        bob
      );
      expect(bobDeposit.result).toBeOk();
      
      // 5. Calculate referral bonus
      const bonusCalc = simnet.callPublicFn(
        "bitsave-referrals",
        "calculate-referral-bonus",
        [Cl.uint(15000000)],
        bob
      );
      expect(bonusCalc.result).toBeOk();
      
      // 6. Complete deposit cycle
      simnet.mineEmptyBlocks(2100);
      
      const bobWithdraw = simnet.callPublicFn("bitsave", "withdraw", [], bob);
      expect(bobWithdraw.result).toBeOk();
      
      // 7. Check if eligible for badge
      const bobReputation = simnet.callReadOnlyFn(
        "bitsave",
        "get-reputation",
        [Cl.principal(bob)],
        deployer
      );
      const bobRepData = bobReputation.result.expectOk().expectTuple();
      
      // 8. Mint badge if eligible
      if (bobRepData["points"].expectInt() >= 1000) {
        const badgeMint = simnet.callPublicFn(
          "bitsave-badges",
          "mint",
          [
            Cl.principal(bob),
            Cl.utf8('{"name":"Referred Loyal Saver","tier":"gold","threshold":1000}')
          ],
          deployer
        );
        expect(badgeMint.result).toBeOk();
      }
      
      // 9. Verify system coordination
      const systemChecks = [
        () => simnet.callReadOnlyFn("bitsave-badges", "get-authorized-minter", [], deployer),
        () => simnet.callReadOnlyFn("bitsave-referrals", "get-referrer", [Cl.principal(bob)], deployer),
        () => simnet.callReadOnlyFn("bitsave-upgrade", "is-upgrade-enabled", [], deployer)
      ];
      
      systemChecks.forEach(check => {
        const result = check();
        expect(result.result).toBeOk();
      });
      
      // Cleanup
      simnet.callPublicFn("bitsave-upgrade", "disable-upgrade", [], deployer);
    });

    it("should handle cross-contract error propagation", () => {
      // Test error handling across contracts
      
      // 1. Unauthorized badge minting should fail
      const unauthorizedMint = simnet.callPublicFn(
        "bitsave-badges",
        "mint",
        [
          Cl.principal(alice),
          Cl.utf8('{"name":"Unauthorized Badge","tier":"bronze"}')
        ],
        alice // Not authorized minter
      );
      expect(unauthorizedMint.result).toBeErr();
      
      // 2. Invalid referral should fail
      const invalidReferral = simnet.callPublicFn(
        "bitsave-referrals",
        "register-referral",
        [Cl.principal(alice)],
        alice // Self-referral
      );
      expect(invalidReferral.result).toBeErr(Cl.uint(302)); // ERR_SELF_REFERRAL
      
      // 3. Unauthorized upgrade should fail
      const unauthorizedUpgrade = simnet.callPublicFn(
        "bitsave-upgrade",
        "enable-upgrade",
        [Cl.principal(bob)],
        alice // Not admin
      );
      expect(unauthorizedUpgrade.result).toBeErr(Cl.uint(200)); // ERR_NOT_AUTHORIZED
      
      // 4. Main contract should still work despite other contract errors
      const validDeposit = simnet.callPublicFn(
        "bitsave",
        "deposit",
        [Cl.uint(5000000), Cl.uint(1000)],
        alice
      );
      expect(validDeposit.result).toBeOk();
    });

    it("should handle contract interdependency scenarios", () => {
      // Test scenarios where contracts depend on each other
      
      // Setup badge system first
      simnet.callPublicFn("bitsave-badges", "set-authorized-minter", [Cl.principal(deployer)], deployer);
      
      // Setup referral system
      simnet.callPublicFn("bitsave-referrals", "register-referral", [Cl.principal(alice)], bob);
      
      // User activity that involves multiple contracts
      const userJourney = [
        // 1. Bob (referred user) makes deposit
        () => simnet.callPublicFn("bitsave", "deposit", [Cl.uint(20000000), Cl.uint(3000)], bob),
        
        // 2. Calculate referral bonus
        () => simnet.callPublicFn("bitsave-referrals", "calculate-referral-bonus", [Cl.uint(20000000)], bob),
        
        // 3. Complete deposit cycle
        () => simnet.mineEmptyBlocks(3100),
        
        // 4. Withdraw with reputation gain
        () => simnet.callPublicFn("bitsave", "withdraw", [], bob),
        
        // 5. Mint badge for achievement
        () => simnet.callPublicFn(
          "bitsave-badges",
          "mint",
          [
            Cl.principal(bob),
            Cl.utf8('{"name":"High Value Saver","tier":"platinum","threshold":2000}')
          ],
          deployer
        )
      ];
      
      userJourney.forEach((step, index) => {
        const result = step();
        if (typeof result === "object" && "result" in result) {
          expect(result.result).toBeOk();
        }
      });
      
      // Verify final state across all contracts
      const finalChecks = [
        // BitSave reputation
        () => {
          const rep = simnet.callReadOnlyFn("bitsave", "get-reputation", [Cl.principal(bob)], deployer);
          expect(rep.result).toBeOk();
        },
        
        // Badge ownership
        () => {
          const owner = simnet.callReadOnlyFn("bitsave-badges", "get-owner", [Cl.uint(1)], deployer);
          expect(owner.result).toBeOk(Cl.some(Cl.principal(bob)));
        },
        
        // Referral stats
        () => {
          const stats = simnet.callReadOnlyFn("bitsave-referrals", "get-referral-stats", [Cl.principal(alice)], deployer);
          expect(stats.result).toBeOk();
        }
      ];
      
      finalChecks.forEach(check => check());
    });
  });

  describe("System Integration Stress Tests", () => {
    it("should handle high-volume cross-contract operations", () => {
      // Setup system
      simnet.callPublicFn("bitsave-badges", "set-authorized-minter", [Cl.principal(deployer)], deployer);
      
      const users = [alice, bob, charlie];
      const operations = 5;
      
      // Setup referrals
      simnet.callPublicFn("bitsave-referrals", "register-referral", [Cl.principal(alice)], bob);
      simnet.callPublicFn("bitsave-referrals", "register-referral", [Cl.principal(alice)], charlie);
      
      // High-volume operations
      for (let i = 0; i < operations; i++) {
        users.forEach((user, index) => {
          const amount = 5000000 + (i * 2000000) + (index * 1000000);
          const period = 800 + (i * 200);
          
          // Deposit
          const depositResult = simnet.callPublicFn(
            "bitsave",
            "deposit",
            [Cl.uint(amount), Cl.uint(period)],
            user
          );
          expect(depositResult.result).toBeOk();
          
          // Calculate referral bonus if applicable
          if (user !== alice) { // Bob and Charlie are referred
            const bonusResult = simnet.callPublicFn(
              "bitsave-referrals",
              "calculate-referral-bonus",
              [Cl.uint(amount)],
              user
            );
            expect(bonusResult.result).toBeOk();
          }
          
          // Complete cycle
          simnet.mineEmptyBlocks(period + 10);
          
          const withdrawResult = simnet.callPublicFn("bitsave", "withdraw", [], user);
          expect(withdrawResult.result).toBeOk();
          
          // Mint badge for each cycle
          const badgeResult = simnet.callPublicFn(
            "bitsave-badges",
            "mint",
            [
              Cl.principal(user),
              Cl.utf8(`{"name":"Cycle ${i + 1} Badge","tier":"bronze","cycle":${i + 1}}`)
            ],
            deployer
          );
          expect(badgeResult.result).toBeOk();
          
          simnet.mineEmptyBlocks(150); // Cooldown
        });
      }
      
      // Verify system integrity after high-volume operations
      users.forEach(user => {
        const reputation = simnet.callReadOnlyFn("bitsave", "get-reputation", [Cl.principal(user)], deployer);
        const repData = reputation.result.expectOk().expectTuple();
        expect(repData["current-streak"]).toBeUint(operations);
      });
      
      // Check badge count
      const nextTokenId = simnet.callReadOnlyFn("bitsave-badges", "get-next-token-id", [], deployer);
      expect(nextTokenId.result).toBeOk(Cl.uint(users.length * operations + 1));
    });
  });
});
