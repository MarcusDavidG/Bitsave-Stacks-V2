import { describe, it, expect, beforeEach } from 'vitest';
import { Cl } from '@stacks/transactions';

const accounts = simnet.getAccounts();
const deployer = accounts.get('deployer')!;
const user1 = accounts.get('wallet_1')!;

describe('BitSave Constants Integration', () => {
  beforeEach(() => {
    // Deploy constants contract first
    simnet.deployContract(
      'bitsave-constants',
      readFileSync('./contracts/bitsave-constants.clar', 'utf8'),
      null,
      deployer
    );
  });

  it('should validate minimum lock period', () => {
    const result = simnet.callReadOnlyFn(
      'bitsave-constants',
      'MIN-LOCK-PERIOD',
      [],
      deployer
    );
    expect(result.result).toBeUint(144);
  });

  it('should validate maximum lock period', () => {
    const result = simnet.callReadOnlyFn(
      'bitsave-constants',
      'MAX-LOCK-PERIOD', 
      [],
      deployer
    );
    expect(result.result).toBeUint(1051200);
  });

  it('should validate minimum deposit amount', () => {
    const result = simnet.callReadOnlyFn(
      'bitsave-constants',
      'MIN-DEPOSIT-AMOUNT',
      [],
      deployer
    );
    expect(result.result).toBeUint(1000000);
  });

  it('should validate badge threshold', () => {
    const result = simnet.callReadOnlyFn(
      'bitsave-constants',
      'BADGE-THRESHOLD',
      [],
      deployer
    );
    expect(result.result).toBeUint(1000);
  });
});
