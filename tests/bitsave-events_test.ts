import { describe, it, expect, beforeEach } from 'vitest';
import { Cl } from '@stacks/transactions';

const accounts = simnet.getAccounts();
const deployer = accounts.get('deployer')!;
const user1 = accounts.get('wallet_1')!;

describe('BitSave Events System', () => {
  beforeEach(() => {
    simnet.deployContract(
      'bitsave-events',
      readFileSync('./contracts/bitsave-events.clar', 'utf8'),
      null,
      deployer
    );
  });

  it('should track event counter correctly', () => {
    const result = simnet.callReadOnlyFn(
      'bitsave-events',
      'get-event-count',
      [],
      deployer
    );
    expect(result.result).toBeUint(0);
  });

  it('should retrieve events by ID', () => {
    const result = simnet.callReadOnlyFn(
      'bitsave-events',
      'get-event',
      [Cl.uint(1)],
      deployer
    );
    expect(result.result).toBeNone();
  });

  it('should handle non-existent events gracefully', () => {
    const result = simnet.callReadOnlyFn(
      'bitsave-events',
      'get-event',
      [Cl.uint(999)],
      deployer
    );
    expect(result.result).toBeNone();
  });
});
