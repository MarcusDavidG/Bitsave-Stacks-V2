import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;

describe("BitSave Performance Benchmarking", () => {
  beforeEach(() => {
    // Reset simnet state before each test
  });

  describe("Function Execution Benchmarks", () => {
    it("should benchmark deposit function performance", () => {
      const testCases = [
        { amount: 1000000, period: 144, description: "minimum deposit" },
        { amount: 10000000, period: 4320, description: "medium deposit" },
        { amount: 50000000000000, period: 52560, description: "large deposit" }
      ];
      
      const benchmarks: Array<{ description: string; executionTime: number }> = [];
      
      testCases.forEach((testCase, index) => {
        const user = index === 0 ? alice : index === 1 ? bob : deployer;
        
        const startTime = performance.now();
        
        const result = simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(testCase.amount), Cl.uint(testCase.period)],
          user
        );
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        expect(result.result).toBeOk();
        
        benchmarks.push({
          description: testCase.description,
          executionTime
        });
        
        // Clean up
        simnet.mineEmptyBlocks(testCase.period + 10);
        simnet.callPublicFn("bitsave", "withdraw", [], user);
        simnet.mineEmptyBlocks(150);
      });
      
      // Log benchmark results
      console.log("Deposit Function Benchmarks:");
      benchmarks.forEach(benchmark => {
        console.log(`${benchmark.description}: ${benchmark.executionTime.toFixed(2)}ms`);
        expect(benchmark.executionTime).toBeLessThan(100); // Should be under 100ms
      });
    });

    it("should benchmark withdraw function performance", () => {
      const testScenarios = [
        { description: "early withdrawal", waitBlocks: 50, expectedEarly: true },
        { description: "mature withdrawal", waitBlocks: 1100, expectedEarly: false },
        { description: "long-term withdrawal", waitBlocks: 5000, expectedEarly: false }
      ];
      
      const benchmarks: Array<{ description: string; executionTime: number }> = [];
      
      testScenarios.forEach((scenario, index) => {
        const user = index === 0 ? alice : index === 1 ? bob : deployer;
        
        // Setup deposit
        simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(5000000), Cl.uint(1000)],
          user
        );
        
        simnet.mineEmptyBlocks(scenario.waitBlocks);
        
        const startTime = performance.now();
        
        const result = simnet.callPublicFn(
          "bitsave",
          "withdraw",
          [],
          user
        );
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        expect(result.result).toBeOk();
        
        const withdrawData = result.result.expectOk().expectTuple();
        expect(withdrawData["early-withdrawal"]).toBeBool(scenario.expectedEarly);
        
        benchmarks.push({
          description: scenario.description,
          executionTime
        });
        
        simnet.mineEmptyBlocks(150); // Cooldown
      });
      
      console.log("Withdraw Function Benchmarks:");
      benchmarks.forEach(benchmark => {
        console.log(`${benchmark.description}: ${benchmark.executionTime.toFixed(2)}ms`);
        expect(benchmark.executionTime).toBeLessThan(150); // Should be under 150ms
      });
    });

    it("should benchmark read-only function performance", () => {
      // Setup test data
      simnet.callPublicFn("bitsave", "deposit", [Cl.uint(10000000), Cl.uint(1000)], alice);
      
      const readOnlyFunctions = [
        { name: "get-savings", params: [Cl.principal(alice)] },
        { name: "get-reputation", params: [Cl.principal(alice)] },
        { name: "get-reward-rate", params: [] },
        { name: "is-paused", params: [] },
        { name: "get-minimum-deposit", params: [] },
        { name: "get-compound-frequency", params: [] },
        { name: "get-early-withdrawal-penalty", params: [] }
      ];
      
      const benchmarks: Array<{ name: string; executionTime: number }> = [];
      
      readOnlyFunctions.forEach(func => {
        const startTime = performance.now();
        
        const result = simnet.callReadOnlyFn(
          "bitsave",
          func.name,
          func.params,
          deployer
        );
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        expect(result.result).toBeOk();
        
        benchmarks.push({
          name: func.name,
          executionTime
        });
      });
      
      console.log("Read-only Function Benchmarks:");
      benchmarks.forEach(benchmark => {
        console.log(`${benchmark.name}: ${benchmark.executionTime.toFixed(2)}ms`);
        expect(benchmark.executionTime).toBeLessThan(50); // Should be very fast
      });
    });
  });

  describe("Batch Operation Benchmarks", () => {
    it("should benchmark batch-get-savings performance", () => {
      const users = [alice, bob, deployer];
      
      // Setup data for all users
      users.forEach(user => {
        simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(5000000), Cl.uint(1000)],
          user
        );
      });
      
      const batchSizes = [1, 3, 5, 10];
      const benchmarks: Array<{ size: number; executionTime: number }> = [];
      
      batchSizes.forEach(size => {
        const userList = Array(size).fill(alice);
        
        const startTime = performance.now();
        
        const result = simnet.callReadOnlyFn(
          "bitsave",
          "batch-get-savings",
          [Cl.list(userList.map(u => Cl.principal(u)))],
          deployer
        );
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        expect(result.result).toBeOk();
        
        benchmarks.push({
          size,
          executionTime
        });
      });
      
      console.log("Batch Operation Benchmarks:");
      benchmarks.forEach(benchmark => {
        console.log(`Batch size ${benchmark.size}: ${benchmark.executionTime.toFixed(2)}ms`);
        expect(benchmark.executionTime).toBeLessThan(size * 20); // Linear scaling
      });
    });

    it("should compare individual vs batch performance", () => {
      const users = [alice, bob, deployer];
      
      // Setup data
      users.forEach(user => {
        simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(3000000), Cl.uint(500)],
          user
        );
      });
      
      // Benchmark individual calls
      const individualStartTime = performance.now();
      
      users.forEach(user => {
        simnet.callReadOnlyFn(
          "bitsave",
          "get-savings",
          [Cl.principal(user)],
          deployer
        );
      });
      
      const individualEndTime = performance.now();
      const individualTime = individualEndTime - individualStartTime;
      
      // Benchmark batch call
      const batchStartTime = performance.now();
      
      simnet.callReadOnlyFn(
        "bitsave",
        "batch-get-savings",
        [Cl.list(users.map(u => Cl.principal(u)))],
        deployer
      );
      
      const batchEndTime = performance.now();
      const batchTime = batchEndTime - batchStartTime;
      
      console.log(`Individual calls: ${individualTime.toFixed(2)}ms`);
      console.log(`Batch call: ${batchTime.toFixed(2)}ms`);
      console.log(`Efficiency gain: ${((individualTime - batchTime) / individualTime * 100).toFixed(1)}%`);
      
      // Batch should be more efficient or at least comparable
      expect(batchTime).toBeLessThanOrEqual(individualTime * 1.2);
    });
  });

  describe("Data Structure Performance", () => {
    it("should benchmark deposit history performance", () => {
      const historySizes = [1, 5, 10, 20];
      const benchmarks: Array<{ size: number; executionTime: number }> = [];
      
      historySizes.forEach(targetSize => {
        // Build up history to target size
        for (let i = 0; i < targetSize; i++) {
          simnet.callPublicFn(
            "bitsave",
            "deposit",
            [Cl.uint(1000000 + i * 100000), Cl.uint(50 + i)],
            alice
          );
          
          simnet.mineEmptyBlocks(60 + i);
          simnet.callPublicFn("bitsave", "withdraw", [], alice);
          simnet.mineEmptyBlocks(150);
        }
        
        // Benchmark history retrieval
        const startTime = performance.now();
        
        const result = simnet.callReadOnlyFn(
          "bitsave",
          "get-deposit-history",
          [Cl.principal(alice), Cl.uint(targetSize)],
          deployer
        );
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        expect(result.result).toBeOk();
        
        benchmarks.push({
          size: targetSize,
          executionTime
        });
      });
      
      console.log("Deposit History Benchmarks:");
      benchmarks.forEach(benchmark => {
        console.log(`History size ${benchmark.size}: ${benchmark.executionTime.toFixed(2)}ms`);
        expect(benchmark.executionTime).toBeLessThan(benchmark.size * 10); // Should scale reasonably
      });
    });

    it("should benchmark event log performance", () => {
      const eventCounts = [5, 10, 20, 50];
      const benchmarks: Array<{ count: number; executionTime: number }> = [];
      
      eventCounts.forEach(targetCount => {
        // Generate events up to target count
        for (let i = 0; i < targetCount; i++) {
          simnet.callPublicFn(
            "bitsave",
            "set-reward-rate",
            [Cl.uint(10 + (i % 10))],
            deployer
          );
        }
        
        // Benchmark event retrieval
        const startTime = performance.now();
        
        const result = simnet.callReadOnlyFn(
          "bitsave",
          "get-contract-events",
          [Cl.uint(targetCount)],
          deployer
        );
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        expect(result.result).toBeOk();
        
        benchmarks.push({
          count: targetCount,
          executionTime
        });
      });
      
      console.log("Event Log Benchmarks:");
      benchmarks.forEach(benchmark => {
        console.log(`Event count ${benchmark.count}: ${benchmark.executionTime.toFixed(2)}ms`);
        expect(benchmark.executionTime).toBeLessThan(benchmark.count * 5); // Should scale well
      });
    });
  });

  describe("Complex Calculation Benchmarks", () => {
    it("should benchmark reward calculation performance", () => {
      const calculationScenarios = [
        { amount: 1000000, period: 144, rate: 10, description: "simple calculation" },
        { amount: 50000000000000, period: 52560, rate: 50, description: "complex calculation" },
        { amount: 25000000000000, period: 105120, rate: 100, description: "maximum complexity" }
      ];
      
      const benchmarks: Array<{ description: string; executionTime: number }> = [];
      
      calculationScenarios.forEach((scenario, index) => {
        // Set reward rate
        simnet.callPublicFn(
          "bitsave",
          "set-reward-rate",
          [Cl.uint(scenario.rate)],
          deployer
        );
        
        const user = index === 0 ? alice : index === 1 ? bob : deployer;
        
        // Deposit
        simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(scenario.amount), Cl.uint(scenario.period)],
          user
        );
        
        // Wait for maturity
        simnet.mineEmptyBlocks(scenario.period + 10);
        
        // Benchmark withdrawal (includes reward calculation)
        const startTime = performance.now();
        
        const result = simnet.callPublicFn(
          "bitsave",
          "withdraw",
          [],
          user
        );
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        expect(result.result).toBeOk();
        
        benchmarks.push({
          description: scenario.description,
          executionTime
        });
        
        simnet.mineEmptyBlocks(150); // Cooldown
      });
      
      console.log("Reward Calculation Benchmarks:");
      benchmarks.forEach(benchmark => {
        console.log(`${benchmark.description}: ${benchmark.executionTime.toFixed(2)}ms`);
        expect(benchmark.executionTime).toBeLessThan(200); // Complex calculations should still be fast
      });
      
      // Reset reward rate
      simnet.callPublicFn("bitsave", "set-reward-rate", [Cl.uint(10)], deployer);
    });

    it("should benchmark streak calculation performance", () => {
      const streakLengths = [1, 5, 10, 20];
      const benchmarks: Array<{ length: number; executionTime: number }> = [];
      
      streakLengths.forEach(targetLength => {
        // Build up streak
        for (let i = 0; i < targetLength; i++) {
          simnet.callPublicFn(
            "bitsave",
            "deposit",
            [Cl.uint(2000000), Cl.uint(100)],
            alice
          );
          
          simnet.mineEmptyBlocks(150);
          
          // Benchmark withdrawal (includes streak calculation)
          const startTime = performance.now();
          
          const result = simnet.callPublicFn(
            "bitsave",
            "withdraw",
            [],
            alice
          );
          
          const endTime = performance.now();
          const executionTime = endTime - startTime;
          
          expect(result.result).toBeOk();
          
          if (i === targetLength - 1) {
            benchmarks.push({
              length: targetLength,
              executionTime
            });
          }
          
          simnet.mineEmptyBlocks(150); // Cooldown
        }
      });
      
      console.log("Streak Calculation Benchmarks:");
      benchmarks.forEach(benchmark => {
        console.log(`Streak length ${benchmark.length}: ${benchmark.executionTime.toFixed(2)}ms`);
        expect(benchmark.executionTime).toBeLessThan(150); // Should remain fast regardless of streak length
      });
    });
  });

  describe("Concurrent Operation Benchmarks", () => {
    it("should benchmark concurrent read operations", () => {
      // Setup data
      const users = [alice, bob, deployer];
      users.forEach(user => {
        simnet.callPublicFn(
          "bitsave",
          "deposit",
          [Cl.uint(5000000), Cl.uint(1000)],
          user
        );
      });
      
      const operationCounts = [5, 10, 20];
      const benchmarks: Array<{ count: number; executionTime: number }> = [];
      
      operationCounts.forEach(count => {
        const startTime = performance.now();
        
        // Simulate concurrent reads
        for (let i = 0; i < count; i++) {
          const user = users[i % users.length];
          simnet.callReadOnlyFn(
            "bitsave",
            "get-savings",
            [Cl.principal(user)],
            deployer
          );
        }
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        benchmarks.push({
          count,
          executionTime
        });
      });
      
      console.log("Concurrent Read Benchmarks:");
      benchmarks.forEach(benchmark => {
        console.log(`${benchmark.count} operations: ${benchmark.executionTime.toFixed(2)}ms`);
        console.log(`Average per operation: ${(benchmark.executionTime / benchmark.count).toFixed(2)}ms`);
        expect(benchmark.executionTime / benchmark.count).toBeLessThan(20); // Each operation should be fast
      });
    });
  });
});
