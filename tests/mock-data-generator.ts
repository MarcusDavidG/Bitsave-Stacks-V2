import { Cl } from "@stacks/transactions";

/**
 * Mock Data Generators for BitSave Testing
 * Provides utilities to generate realistic test data for comprehensive testing
 */

export class BitSaveMockDataGenerator {
  private static instance: BitSaveMockDataGenerator;
  private seedValue: number = 12345;

  private constructor() {}

  public static getInstance(): BitSaveMockDataGenerator {
    if (!BitSaveMockDataGenerator.instance) {
      BitSaveMockDataGenerator.instance = new BitSaveMockDataGenerator();
    }
    return BitSaveMockDataGenerator.instance;
  }

  /**
   * Simple seeded random number generator for reproducible tests
   */
  private seededRandom(): number {
    this.seedValue = (this.seedValue * 9301 + 49297) % 233280;
    return this.seedValue / 233280;
  }

  /**
   * Reset seed for reproducible test runs
   */
  public resetSeed(seed: number = 12345): void {
    this.seedValue = seed;
  }

  /**
   * Generate random deposit amount within valid range
   */
  public generateDepositAmount(min: number = 1000000, max: number = 100000000000000): number {
    const range = max - min;
    return Math.floor(min + (this.seededRandom() * range));
  }

  /**
   * Generate random lock period
   */
  public generateLockPeriod(min: number = 144, max: number = 52560): number {
    const range = max - min;
    return Math.floor(min + (this.seededRandom() * range));
  }

  /**
   * Generate realistic user deposit scenarios
   */
  public generateUserScenarios(count: number): Array<{
    userType: string;
    amount: number;
    period: number;
    goalAmount: number;
    goalDescription: string;
  }> {
    const scenarios = [];
    const userTypes = ["conservative", "moderate", "aggressive", "whale"];
    const goalDescriptions = [
      "Emergency fund",
      "House down payment",
      "Retirement savings",
      "Vacation fund",
      "Education fund",
      "Investment capital",
      "Business startup",
      "Wedding expenses"
    ];

    for (let i = 0; i < count; i++) {
      const userType = userTypes[Math.floor(this.seededRandom() * userTypes.length)];
      let amount: number;
      let period: number;
      let goalMultiplier: number;

      switch (userType) {
        case "conservative":
          amount = this.generateDepositAmount(1000000, 10000000); // 1-10 STX
          period = this.generateLockPeriod(144, 4320); // 1 day - 1 month
          goalMultiplier = 2;
          break;
        case "moderate":
          amount = this.generateDepositAmount(5000000, 50000000); // 5-50 STX
          period = this.generateLockPeriod(4320, 25920); // 1-6 months
          goalMultiplier = 5;
          break;
        case "aggressive":
          amount = this.generateDepositAmount(20000000, 200000000); // 20-200 STX
          period = this.generateLockPeriod(25920, 52560); // 6 months - 1 year
          goalMultiplier = 10;
          break;
        case "whale":
          amount = this.generateDepositAmount(500000000, 100000000000000); // 500-100k STX
          period = this.generateLockPeriod(52560, 105120); // 1-2 years
          goalMultiplier = 20;
          break;
        default:
          amount = this.generateDepositAmount();
          period = this.generateLockPeriod();
          goalMultiplier = 3;
      }

      const goalAmount = amount * goalMultiplier;
      const goalDescription = goalDescriptions[Math.floor(this.seededRandom() * goalDescriptions.length)];

      scenarios.push({
        userType,
        amount,
        period,
        goalAmount,
        goalDescription
      });
    }

    return scenarios;
  }

  /**
   * Generate admin parameter change scenarios
   */
  public generateAdminScenarios(count: number): Array<{
    action: string;
    parameter: string;
    value: number;
    reason: string;
  }> {
    const scenarios = [];
    const actions = ["increase", "decrease", "reset"];
    const parameters = ["reward-rate", "minimum-deposit", "early-withdrawal-penalty", "compound-frequency"];
    const reasons = [
      "Market conditions changed",
      "User feedback",
      "Risk management",
      "Incentive adjustment",
      "System optimization",
      "Regulatory compliance"
    ];

    for (let i = 0; i < count; i++) {
      const action = actions[Math.floor(this.seededRandom() * actions.length)];
      const parameter = parameters[Math.floor(this.seededRandom() * parameters.length)];
      const reason = reasons[Math.floor(this.seededRandom() * reasons.length)];
      
      let value: number;
      
      switch (parameter) {
        case "reward-rate":
          value = Math.floor(5 + (this.seededRandom() * 95)); // 5-100%
          break;
        case "minimum-deposit":
          value = Math.floor(500000 + (this.seededRandom() * 9500000)); // 0.5-10 STX
          break;
        case "early-withdrawal-penalty":
          value = Math.floor(5 + (this.seededRandom() * 95)); // 5-100%
          break;
        case "compound-frequency":
          value = Math.floor(1 + (this.seededRandom() * 23)); // 1-24 times per year
          break;
        default:
          value = 10;
      }

      scenarios.push({
        action,
        parameter,
        value,
        reason
      });
    }

    return scenarios;
  }

  /**
   * Generate time-based event sequences
   */
  public generateEventSequence(length: number): Array<{
    blockDelay: number;
    eventType: string;
    data: any;
  }> {
    const events = [];
    const eventTypes = ["deposit", "withdraw", "admin-change", "pause", "unpause"];
    
    for (let i = 0; i < length; i++) {
      const blockDelay = Math.floor(10 + (this.seededRandom() * 500)); // 10-500 blocks between events
      const eventType = eventTypes[Math.floor(this.seededRandom() * eventTypes.length)];
      
      let data: any;
      
      switch (eventType) {
        case "deposit":
          data = {
            amount: this.generateDepositAmount(1000000, 50000000),
            period: this.generateLockPeriod(144, 10000)
          };
          break;
        case "withdraw":
          data = { early: this.seededRandom() < 0.3 }; // 30% chance of early withdrawal
          break;
        case "admin-change":
          const adminScenario = this.generateAdminScenarios(1)[0];
          data = adminScenario;
          break;
        case "pause":
        case "unpause":
          data = { reason: "System maintenance" };
          break;
        default:
          data = {};
      }

      events.push({
        blockDelay,
        eventType,
        data
      });
    }

    return events;
  }

  /**
   * Generate stress test data
   */
  public generateStressTestData(userCount: number, operationsPerUser: number): Array<{
    userId: number;
    operations: Array<{
      type: string;
      timing: number;
      parameters: any;
    }>;
  }> {
    const stressData = [];
    
    for (let userId = 0; userId < userCount; userId++) {
      const operations = [];
      
      for (let opIndex = 0; opIndex < operationsPerUser; opIndex++) {
        const operationType = this.seededRandom() < 0.7 ? "deposit-withdraw-cycle" : "admin-operation";
        const timing = Math.floor(this.seededRandom() * 1000); // Random timing within 1000 blocks
        
        let parameters: any;
        
        if (operationType === "deposit-withdraw-cycle") {
          parameters = {
            depositAmount: this.generateDepositAmount(1000000, 20000000),
            lockPeriod: this.generateLockPeriod(50, 2000),
            earlyWithdrawal: this.seededRandom() < 0.2 // 20% chance
          };
        } else {
          const adminScenario = this.generateAdminScenarios(1)[0];
          parameters = adminScenario;
        }

        operations.push({
          type: operationType,
          timing,
          parameters
        });
      }

      stressData.push({
        userId,
        operations
      });
    }

    return stressData;
  }

  /**
   * Generate edge case test data
   */
  public generateEdgeCases(): Array<{
    description: string;
    testType: string;
    parameters: any;
    expectedResult: string;
  }> {
    return [
      {
        description: "Minimum deposit amount",
        testType: "deposit",
        parameters: { amount: 1000000, period: 144 },
        expectedResult: "success"
      },
      {
        description: "Maximum deposit amount",
        testType: "deposit",
        parameters: { amount: 100000000000000, period: 144 },
        expectedResult: "success"
      },
      {
        description: "Below minimum deposit",
        testType: "deposit",
        parameters: { amount: 999999, period: 144 },
        expectedResult: "error"
      },
      {
        description: "Above maximum deposit",
        testType: "deposit",
        parameters: { amount: 100000000000001, period: 144 },
        expectedResult: "error"
      },
      {
        description: "Zero deposit amount",
        testType: "deposit",
        parameters: { amount: 0, period: 144 },
        expectedResult: "error"
      },
      {
        description: "Zero lock period",
        testType: "deposit",
        parameters: { amount: 5000000, period: 0 },
        expectedResult: "success"
      },
      {
        description: "Maximum lock period",
        testType: "deposit",
        parameters: { amount: 5000000, period: 4294967295 },
        expectedResult: "success"
      },
      {
        description: "Immediate withdrawal after zero lock",
        testType: "withdraw",
        parameters: { waitBlocks: 0 },
        expectedResult: "success"
      },
      {
        description: "Withdrawal during cooldown",
        testType: "withdraw",
        parameters: { waitBlocks: 0, previousWithdrawal: true },
        expectedResult: "error"
      },
      {
        description: "Maximum penalty rate",
        testType: "admin",
        parameters: { action: "set-early-withdrawal-penalty", value: 100 },
        expectedResult: "success"
      },
      {
        description: "Above maximum penalty rate",
        testType: "admin",
        parameters: { action: "set-early-withdrawal-penalty", value: 101 },
        expectedResult: "error"
      }
    ];
  }

  /**
   * Generate realistic reputation building scenarios
   */
  public generateReputationScenarios(targetReputation: number): Array<{
    cycleNumber: number;
    amount: number;
    period: number;
    expectedPoints: number;
    streakBonus: number;
  }> {
    const scenarios = [];
    let currentReputation = 0;
    let currentStreak = 0;
    
    let cycleNumber = 1;
    
    while (currentReputation < targetReputation) {
      // Generate realistic deposit for reputation building
      const amount = this.generateDepositAmount(5000000, 20000000); // 5-20 STX
      const period = this.generateLockPeriod(1000, 10000); // Decent lock periods
      
      // Estimate points (simplified calculation)
      const basePoints = Math.floor((amount / 1000000) * 10); // Rough estimate
      const streakBonus = Math.min(currentStreak * 10, 100); // Max 100% bonus
      const expectedPoints = basePoints + Math.floor(basePoints * streakBonus / 100);
      
      scenarios.push({
        cycleNumber,
        amount,
        period,
        expectedPoints,
        streakBonus
      });
      
      currentReputation += expectedPoints;
      currentStreak++;
      cycleNumber++;
      
      // Prevent infinite loops
      if (cycleNumber > 50) break;
    }
    
    return scenarios;
  }

  /**
   * Generate contract state validation data
   */
  public generateStateValidationData(): {
    initialState: any;
    operations: Array<any>;
    expectedFinalState: any;
  } {
    return {
      initialState: {
        totalUsers: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        contractPaused: false,
        rewardRate: 10,
        minimumDeposit: 1000000
      },
      operations: [
        { type: "deposit", user: "alice", amount: 5000000, period: 1000 },
        { type: "deposit", user: "bob", amount: 10000000, period: 2000 },
        { type: "admin", action: "set-reward-rate", value: 15 },
        { type: "withdraw", user: "alice", waitBlocks: 1100 },
        { type: "pause", admin: true },
        { type: "unpause", admin: true },
        { type: "withdraw", user: "bob", waitBlocks: 2100 }
      ],
      expectedFinalState: {
        totalUsers: 2,
        totalDeposits: 2,
        totalWithdrawals: 2,
        contractPaused: false,
        rewardRate: 15,
        minimumDeposit: 1000000
      }
    };
  }
}

// Export singleton instance
export const mockDataGenerator = BitSaveMockDataGenerator.getInstance();
