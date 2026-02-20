/**
 * BitSave Badges NFT Contract Test Suite (Clarinet SDK)
 * 
 * Comprehensive unit tests covering:
 * - Authorized minting (authorization checks)
 * - NFT rules (ownership, transfer, burn, metadata)
 * - Auto-badge integration with BitSave contract
 * - SIP-009 compliance
 * 
 * Following: https://docs.hiro.so/en/tools/clarinet/sdk-introduction
 */

import { describe, expect, it, beforeEach } from 'vitest';
import { Cl } from '@stacks/transactions';

const accounts = simnet.getAccounts();
const deployer = accounts.get('deployer')!;
const wallet1 = accounts.get('wallet_1')!;
const wallet2 = accounts.get('wallet_2')!;
const wallet3 = accounts.get('wallet_3')!;

describe('BitSave Badges - Initialization', () => {
  beforeEach(() => {
    simnet.setEpoch('3.0');
  });

  it('should initialize with admin set to deployer', () => {
    const { result } = simnet.callReadOnlyFn(
      'bitsave-badges',
      'get-admin',
      [],
      deployer
    );

    expect(result).toBeOk(Cl.principal(deployer));
  });

  it('should initialize with authorized minter set to deployer', () => {
    const { result } = simnet.callReadOnlyFn(
      'bitsave-badges',
      'get-authorized-minter',
      [],
      deployer
    );

    expect(result).toBeOk(Cl.principal(deployer));
  });

  it('should initialize with next-token-id as 1', () => {
    const { result } = simnet.callReadOnlyFn(
      'bitsave-badges',
      'get-next-token-id',
      [],
      deployer
    );

    expect(result).toBeOk(Cl.uint(1));
  });

  it('should return 0 as last-token-id when no badges minted', () => {
    const { result } = simnet.callReadOnlyFn(
      'bitsave-badges',
      'get-last-token-id',
      [],
      deployer
    );

    expect(result).toBeOk(Cl.uint(0));
  });
});

describe('BitSave Badges - Admin Controls', () => {
  beforeEach(() => {
    simnet.setEpoch('3.0');
  });

  it('should allow admin to set authorized minter', () => {
    const { result } = simnet.callPublicFn(
      'bitsave-badges',
      'set-authorized-minter',
      [Cl.principal(wallet1)],
      deployer
    );

    expect(result).toBeOk(Cl.principal(wallet1));
  });

  it('should reject non-admin attempts to set authorized minter', () => {
    const { result } = simnet.callPublicFn(
      'bitsave-badges',
      'set-authorized-minter',
      [Cl.principal(wallet2)],
      wallet1
    );

    expect(result).toBeErr(Cl.uint(105)); // ERR_UNAUTHORIZED
  });

  it('should verify authorized minter is updated correctly', () => {
    simnet.callPublicFn(
      'bitsave-badges',
      'set-authorized-minter',
      [Cl.principal(wallet1)],
      deployer
    );

    const { result } = simnet.callReadOnlyFn(
      'bitsave-badges',
      'get-authorized-minter',
      [],
      deployer
    );

    expect(result).toBeOk(Cl.principal(wallet1));
  });

  it('should allow admin to transfer admin role', () => {
    const { result } = simnet.callPublicFn(
      'bitsave-badges',
      'transfer-admin',
      [Cl.principal(wallet1)],
      deployer
    );

    expect(result).toBeOk(Cl.principal(wallet1));

    // Verify new admin
    const adminResult = simnet.callReadOnlyFn(
      'bitsave-badges',
      'get-admin',
      [],
      deployer
    );

    expect(adminResult.result).toBeOk(Cl.principal(wallet1));
  });

  it('should reject non-admin attempts to transfer admin', () => {
    const { result } = simnet.callPublicFn(
      'bitsave-badges',
      'transfer-admin',
      [Cl.principal(wallet1)],
      wallet2
    );

    expect(result).toBeErr(Cl.uint(105)); // ERR_UNAUTHORIZED
  });

  it('should allow setting bitsave contract as authorized minter', () => {
    const bitsaveContract = `${deployer}.bitsave`;
    
    const { result } = simnet.callPublicFn(
      'bitsave-badges',
      'set-authorized-minter',
      [Cl.principal(bitsaveContract)],
      deployer
    );

    expect(result).toBeOk(Cl.principal(bitsaveContract));
  });
});

describe('BitSave Badges - Authorized Minting', () => {
  beforeEach(() => {
    simnet.setEpoch('3.0');
  });

  it('should allow authorized minter to mint badges', () => {
    const metadata = 'Test Badge - Gold Tier';
    
    const { result } = simnet.callPublicFn(
      'bitsave-badges',
      'mint',
      [Cl.principal(wallet1), Cl.stringUtf8(metadata)],
      deployer
    );

    expect(result).toBeOk(Cl.uint(1)); // First token ID
  });

  it('should reject minting from unauthorized users', () => {
    const metadata = 'Unauthorized Badge';
    
    const { result } = simnet.callPublicFn(
      'bitsave-badges',
      'mint',
      [Cl.principal(wallet2), Cl.stringUtf8(metadata)],
      wallet1
    );

    expect(result).toBeErr(Cl.uint(105)); // ERR_UNAUTHORIZED
  });

  it('should increment token ID after each mint', () => {
    const metadata = 'Badge';
    
    simnet.callPublicFn(
      'bitsave-badges',
      'mint',
      [Cl.principal(wallet1), Cl.stringUtf8(metadata)],
      deployer
    );

    const { result: nextId1 } = simnet.callReadOnlyFn(
      'bitsave-badges',
      'get-next-token-id',
      [],
      deployer
    );

    expect(nextId1).toBeOk(Cl.uint(2));

    simnet.callPublicFn(
      'bitsave-badges',
      'mint',
      [Cl.principal(wallet2), Cl.stringUtf8(metadata)],
      deployer
    );

    const { result: nextId2 } = simnet.callReadOnlyFn(
      'bitsave-badges',
      'get-next-token-id',
      [],
      deployer
    );

    expect(nextId2).toBeOk(Cl.uint(3));
  });

  it('should allow minting multiple badges to same user', () => {
    const metadata1 = 'Bronze Badge';
    const metadata2 = 'Silver Badge';
    
    const result1 = simnet.callPublicFn(
      'bitsave-badges',
      'mint',
      [Cl.principal(wallet1), Cl.stringUtf8(metadata1)],
      deployer
    );

    const result2 = simnet.callPublicFn(
      'bitsave-badges',
      'mint',
      [Cl.principal(wallet1), Cl.stringUtf8(metadata2)],
      deployer
    );

    expect(result1.result).toBeOk(Cl.uint(1));
    expect(result2.result).toBeOk(Cl.uint(2));
  });

  it('should mint badges to different users correctly', () => {
    const metadata = 'Loyal Saver Badge';
    
    const result1 = simnet.callPublicFn(
      'bitsave-badges',
      'mint',
      [Cl.principal(wallet1), Cl.stringUtf8(metadata)],
      deployer
    );

    const result2 = simnet.callPublicFn(
      'bitsave-badges',
      'mint',
      [Cl.principal(wallet2), Cl.stringUtf8(metadata)],
      deployer
    );

    const result3 = simnet.callPublicFn(
      'bitsave-badges',
      'mint',
      [Cl.principal(wallet3), Cl.stringUtf8(metadata)],
      deployer
    );

    expect(result1.result).toBeOk(Cl.uint(1));
    expect(result2.result).toBeOk(Cl.uint(2));
    expect(result3.result).toBeOk(Cl.uint(3));
  });
});

describe('BitSave Badges - NFT Ownership', () => {
  beforeEach(() => {
    simnet.setEpoch('3.0');
  });

  it('should correctly assign ownership on mint', () => {
    const metadata = 'Ownership Test Badge';
    
    simnet.callPublicFn(
      'bitsave-badges',
      'mint',
      [Cl.principal(wallet1), Cl.stringUtf8(metadata)],
      deployer
    );

    const { result } = simnet.callReadOnlyFn(
      'bitsave-badges',
      'get-owner',
      [Cl.uint(1)],
      deployer
    );

    expect(result).toBeOk(Cl.some(Cl.principal(wallet1)));
  });

  it('should return none for non-existent token', () => {
    const { result } = simnet.callReadOnlyFn(
      'bitsave-badges',
      'get-owner',
      [Cl.uint(999)],
      deployer
    );

    expect(result).toBeOk(Cl.none());
  });

  it('should track multiple owners independently', () => {
    const metadata = 'Multi-Owner Test';
    
    simnet.callPublicFn(
      'bitsave-badges',
      'mint',
      [Cl.principal(wallet1), Cl.stringUtf8(metadata)],
      deployer
    );

    simnet.callPublicFn(
      'bitsave-badges',
      'mint',
      [Cl.principal(wallet2), Cl.stringUtf8(metadata)],
      deployer
    );

    const owner1 = simnet.callReadOnlyFn(
      'bitsave-badges',
      'get-owner',
      [Cl.uint(1)],
      deployer
    );

    const owner2 = simnet.callReadOnlyFn(
      'bitsave-badges',
      'get-owner',
      [Cl.uint(2)],
      deployer
    );

    expect(owner1.result).toBeOk(Cl.some(Cl.principal(wallet1)));
    expect(owner2.result).toBeOk(Cl.some(Cl.principal(wallet2)));
  });
});

describe('BitSave Badges - NFT Transfers', () => {
  beforeEach(() => {
    simnet.setEpoch('3.0');
  });

  it('should allow owner to transfer their badge', () => {
    const metadata = 'Transfer Test Badge';
    
    simnet.callPublicFn(
      'bitsave-badges',
      'mint',
      [Cl.principal(wallet1), Cl.stringUtf8(metadata)],
      deployer
    );

    const { result } = simnet.callPublicFn(
      'bitsave-badges',
      'transfer',
      [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
      wallet1
    );

    expect(result).toBeOk(Cl.bool(true));

    // Verify new owner
    const ownerResult = simnet.callReadOnlyFn(
      'bitsave-badges',
      'get-owner',
      [Cl.uint(1)],
      deployer
    );

    expect(ownerResult.result).toBeOk(Cl.some(Cl.principal(wallet2)));
  });

  it('should reject transfer from non-owner', () => {
    const metadata = 'Transfer Test Badge';
    
    simnet.callPublicFn(
      'bitsave-badges',
      'mint',
      [Cl.principal(wallet1), Cl.stringUtf8(metadata)],
      deployer
    );

    const { result } = simnet.callPublicFn(
      'bitsave-badges',
      'transfer',
      [Cl.uint(1), Cl.principal(wallet2), Cl.principal(wallet3)],
      wallet2
    );

    expect(result).toBeErr(Cl.uint(106)); // ERR_NOT_OWNER
  });

  it('should reject transfer when sender does not match tx-sender', () => {
    const metadata = 'Transfer Test Badge';
    
    simnet.callPublicFn(
      'bitsave-badges',
      'mint',
      [Cl.principal(wallet1), Cl.stringUtf8(metadata)],
      deployer
    );

    // wallet2 tries to transfer wallet1's badge
    const { result } = simnet.callPublicFn(
      'bitsave-badges',
      'transfer',
      [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet3)],
      wallet2
    );

    expect(result).toBeErr(Cl.uint(105)); // ERR_UNAUTHORIZED
  });

  it('should allow sequential transfers', () => {
    const metadata = 'Sequential Transfer Badge';
    
    simnet.callPublicFn(
      'bitsave-badges',
      'mint',
      [Cl.principal(wallet1), Cl.stringUtf8(metadata)],
      deployer
    );

    // First transfer: wallet1 -> wallet2
    simnet.callPublicFn(
      'bitsave-badges',
      'transfer',
      [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
      wallet1
    );

    // Second transfer: wallet2 -> wallet3
    const { result } = simnet.callPublicFn(
      'bitsave-badges',
      'transfer',
      [Cl.uint(1), Cl.principal(wallet2), Cl.principal(wallet3)],
      wallet2
    );

    expect(result).toBeOk(Cl.bool(true));

    // Verify final owner
    const ownerResult = simnet.callReadOnlyFn(
      'bitsave-badges',
      'get-owner',
      [Cl.uint(1)],
      deployer
    );

    expect(ownerResult.result).toBeOk(Cl.some(Cl.principal(wallet3)));
  });
});

describe('BitSave Badges - NFT Burn', () => {
  beforeEach(() => {
    simnet.setEpoch('3.0');
  });

  it('should allow owner to burn their badge', () => {
    const metadata = 'Burn Test Badge';
    
    simnet.callPublicFn(
      'bitsave-badges',
      'mint',
      [Cl.principal(wallet1), Cl.stringUtf8(metadata)],
      deployer
    );

    const { result } = simnet.callPublicFn(
      'bitsave-badges',
      'burn',
      [Cl.uint(1)],
      wallet1
    );

    expect(result).toBeOk(Cl.bool(true));

    // Verify badge no longer exists
    const ownerResult = simnet.callReadOnlyFn(
      'bitsave-badges',
      'get-owner',
      [Cl.uint(1)],
      deployer
    );

    expect(ownerResult.result).toBeOk(Cl.none());
  });

  it('should reject burn from non-owner', () => {
    const metadata = 'Burn Test Badge';
    
    simnet.callPublicFn(
      'bitsave-badges',
      'mint',
      [Cl.principal(wallet1), Cl.stringUtf8(metadata)],
      deployer
    );

    const { result } = simnet.callPublicFn(
      'bitsave-badges',
      'burn',
      [Cl.uint(1)],
      wallet2
    );

    expect(result).toBeErr(Cl.uint(106)); // ERR_NOT_OWNER
  });

  it('should reject burn of non-existent token', () => {
    const { result } = simnet.callPublicFn(
      'bitsave-badges',
      'burn',
      [Cl.uint(999)],
      wallet1
    );

    expect(result).toBeErr(Cl.uint(107)); // ERR_NOT_FOUND
  });

  it('should remove metadata after burn', () => {
    const metadata = 'Burn Metadata Test';
    
    simnet.callPublicFn(
      'bitsave-badges',
      'mint',
      [Cl.principal(wallet1), Cl.stringUtf8(metadata)],
      deployer
    );

    simnet.callPublicFn(
      'bitsave-badges',
      'burn',
      [Cl.uint(1)],
      wallet1
    );

    const { result } = simnet.callReadOnlyFn(
      'bitsave-badges',
      'get-token-uri',
      [Cl.uint(1)],
      deployer
    );

    expect(result).toBeOk(Cl.none());
  });
});

describe('BitSave Badges - Metadata', () => {
  beforeEach(() => {
    simnet.setEpoch('3.0');
  });

  it('should store and retrieve metadata correctly', () => {
    const metadata = '{"name":"Gold Badge","tier":"gold","points":1000}';
    
    simnet.callPublicFn(
      'bitsave-badges',
      'mint',
      [Cl.principal(wallet1), Cl.stringUtf8(metadata)],
      deployer
    );

    const { result } = simnet.callReadOnlyFn(
      'bitsave-badges',
      'get-token-uri',
      [Cl.uint(1)],
      deployer
    );

    expect(result).toBeOk(Cl.some(Cl.stringUtf8(metadata)));
  });

  it('should return none for metadata of non-existent token', () => {
    const { result } = simnet.callReadOnlyFn(
      'bitsave-badges',
      'get-token-uri',
      [Cl.uint(999)],
      deployer
    );

    expect(result).toBeOk(Cl.none());
  });

  it('should store different metadata for different tokens', () => {
    const metadata1 = '{"name":"Bronze","tier":"bronze"}';
    const metadata2 = '{"name":"Silver","tier":"silver"}';
    const metadata3 = '{"name":"Gold","tier":"gold"}';
    
    simnet.callPublicFn(
      'bitsave-badges',
      'mint',
      [Cl.principal(wallet1), Cl.stringUtf8(metadata1)],
      deployer
    );

    simnet.callPublicFn(
      'bitsave-badges',
      'mint',
      [Cl.principal(wallet2), Cl.stringUtf8(metadata2)],
      deployer
    );

    simnet.callPublicFn(
      'bitsave-badges',
      'mint',
      [Cl.principal(wallet3), Cl.stringUtf8(metadata3)],
      deployer
    );

    const result1 = simnet.callReadOnlyFn('bitsave-badges', 'get-token-uri', [Cl.uint(1)], deployer);
    const result2 = simnet.callReadOnlyFn('bitsave-badges', 'get-token-uri', [Cl.uint(2)], deployer);
    const result3 = simnet.callReadOnlyFn('bitsave-badges', 'get-token-uri', [Cl.uint(3)], deployer);

    expect(result1.result).toBeOk(Cl.some(Cl.stringUtf8(metadata1)));
    expect(result2.result).toBeOk(Cl.some(Cl.stringUtf8(metadata2)));
    expect(result3.result).toBeOk(Cl.some(Cl.stringUtf8(metadata3)));
  });

  it('should handle empty metadata string', () => {
    const metadata = '';
    
    simnet.callPublicFn(
      'bitsave-badges',
      'mint',
      [Cl.principal(wallet1), Cl.stringUtf8(metadata)],
      deployer
    );

    const { result } = simnet.callReadOnlyFn(
      'bitsave-badges',
      'get-token-uri',
      [Cl.uint(1)],
      deployer
    );

    expect(result).toBeOk(Cl.some(Cl.stringUtf8(metadata)));
  });

  it('should handle long metadata strings', () => {
    const metadata = 'A'.repeat(256); // Max UTF-8 string length
    
    const { result } = simnet.callPublicFn(
      'bitsave-badges',
      'mint',
      [Cl.principal(wallet1), Cl.stringUtf8(metadata)],
      deployer
    );

    expect(result).toBeOk(Cl.uint(1));
  });
});

describe('BitSave Badges - SIP-009 Compliance', () => {
  beforeEach(() => {
    simnet.setEpoch('3.0');
  });

  it('should implement get-last-token-id correctly', () => {
    const metadata = 'SIP-009 Test';
    
    // No badges minted
    let result = simnet.callReadOnlyFn('bitsave-badges', 'get-last-token-id', [], deployer);
    expect(result.result).toBeOk(Cl.uint(0));

    // Mint first badge
    simnet.callPublicFn(
      'bitsave-badges',
      'mint',
      [Cl.principal(wallet1), Cl.stringUtf8(metadata)],
      deployer
    );

    result = simnet.callReadOnlyFn('bitsave-badges', 'get-last-token-id', [], deployer);
    expect(result.result).toBeOk(Cl.uint(1));

    // Mint second badge
    simnet.callPublicFn(
      'bitsave-badges',
      'mint',
      [Cl.principal(wallet2), Cl.stringUtf8(metadata)],
      deployer
    );

    result = simnet.callReadOnlyFn('bitsave-badges', 'get-last-token-id', [], deployer);
    expect(result.result).toBeOk(Cl.uint(2));
  });

  it('should maintain token ID sequence', () => {
    const metadata = 'Sequence Test';
    
    for (let i = 1; i <= 5; i++) {
      const mintResult = simnet.callPublicFn(
        'bitsave-badges',
        'mint',
        [Cl.principal(wallet1), Cl.stringUtf8(`${metadata} ${i}`)],
        deployer
      );

      expect(mintResult.result).toBeOk(Cl.uint(i));
    }

    const lastTokenId = simnet.callReadOnlyFn('bitsave-badges', 'get-last-token-id', [], deployer);
    expect(lastTokenId.result).toBeOk(Cl.uint(5));
  });
});
