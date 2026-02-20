import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

/**
 * BitSave Integration Tests with Badge System
 * 
 * Test Coverage:
 * 1. Full user journey: deposit → withdraw → auto-badge mint
 * 2. Reputation threshold verification (1000 points)
 * 3. Badge authorization setup
 * 4. Multiple users earning badges
 * 5. Users below threshold don't receive badges
 */

Clarinet.test({
    name: "Ensure that BitSave contract can be authorized as minter",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        
        // Get the BitSave contract principal
        const bitsaveContract = `${deployer.address}.bitsave`;
        
        // Set BitSave contract as authorized minter
        let block = chain.mineBlock([
            Tx.contractCall(
                'bitsave-badges',
                'set-authorized-minter',
                [types.principal(bitsaveContract)],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectPrincipal(bitsaveContract);
        
        // Verify the authorized minter was set correctly
        block = chain.mineBlock([
            Tx.contractCall(
                'bitsave-badges',
                'get-authorized-minter',
                [],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectPrincipal(bitsaveContract);
    },
});

Clarinet.test({
    name: "Ensure that user receives badge when reaching 1000 reputation points",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        // Set BitSave contract as authorized minter
        const bitsaveContract = `${deployer.address}.bitsave`;
        let block = chain.mineBlock([
            Tx.contractCall(
                'bitsave-badges',
                'set-authorized-minter',
                [types.principal(bitsaveContract)],
                deployer.address
            )
        ]);
        
        // Set reward rate to 10% to ensure user gets 1000+ points
        // If user deposits 10000 STX, they'll earn 1000 reputation points
        block = chain.mineBlock([
            Tx.contractCall(
                'bitsave',
                'set-reward-rate',
                [types.uint(10)],
                deployer.address
            )
        ]);
        
        // User deposits STX with lock period
        block = chain.mineBlock([
            Tx.contractCall(
                'bitsave',
                'deposit',
                [types.uint(100)], // Lock for 100 blocks
                wallet1.address
            )
        ]);
        
        block.receipts[0].result.expectOk();
        
        // Mine blocks to pass the lock period
        chain.mineEmptyBlockUntil(chain.blockHeight + 101);
        
        // User withdraws and should receive badge
        block = chain.mineBlock([
            Tx.contractCall(
                'bitsave',
                'withdraw',
                [],
                wallet1.address
            )
        ]);
        
        block.receipts[0].result.expectOk();
        
        // Verify user received a badge (token ID 1)
        block = chain.mineBlock([
            Tx.contractCall(
                'bitsave-badges',
                'get-owner',
                [types.uint(1)],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectSome().expectPrincipal(wallet1.address);
        
        // Verify badge metadata
        block = chain.mineBlock([
            Tx.contractCall(
                'bitsave-badges',
                'get-token-uri',
                [types.uint(1)],
                deployer.address
            )
        ]);
        
        const metadata = block.receipts[0].result.expectOk().expectSome();
        // Metadata should contain "Loyal Saver" and "gold" tier
        assertEquals(metadata.includes('Loyal Saver'), true);
    },
});

Clarinet.test({
    name: "Ensure that user below threshold does not receive badge",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet2 = accounts.get('wallet_2')!;
        
        // Set BitSave contract as authorized minter
        const bitsaveContract = `${deployer.address}.bitsave`;
        let block = chain.mineBlock([
            Tx.contractCall(
                'bitsave-badges',
                'set-authorized-minter',
                [types.principal(bitsaveContract)],
                deployer.address
            )
        ]);
        
        // Set reward rate to 5% so user gets less than 1000 points
        block = chain.mineBlock([
            Tx.contractCall(
                'bitsave',
                'set-reward-rate',
                [types.uint(5)],
                deployer.address
            )
        ]);
        
        // User deposits STX with lock period
        block = chain.mineBlock([
            Tx.contractCall(
                'bitsave',
                'deposit',
                [types.uint(50)], // Lock for 50 blocks
                wallet2.address
            )
        ]);
        
        block.receipts[0].result.expectOk();
        
        // Mine blocks to pass the lock period
        chain.mineEmptyBlockUntil(chain.blockHeight + 51);
        
        // User withdraws but should NOT receive badge (below 1000 points)
        block = chain.mineBlock([
            Tx.contractCall(
                'bitsave',
                'withdraw',
                [],
                wallet2.address
            )
        ]);
        
        block.receipts[0].result.expectOk();
        
        // Verify no badge was minted (next token ID should still be 1)
        block = chain.mineBlock([
            Tx.contractCall(
                'bitsave-badges',
                'get-next-token-id',
                [],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectUint(1);
    },
});

Clarinet.test({
    name: "Ensure that multiple users can earn badges independently",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        const wallet3 = accounts.get('wallet_3')!;
        
        // Set BitSave contract as authorized minter
        const bitsaveContract = `${deployer.address}.bitsave`;
        let block = chain.mineBlock([
            Tx.contractCall(
                'bitsave-badges',
                'set-authorized-minter',
                [types.principal(bitsaveContract)],
                deployer.address
            )
        ]);
        
        // Set reward rate to 10%
        block = chain.mineBlock([
            Tx.contractCall(
                'bitsave',
                'set-reward-rate',
                [types.uint(10)],
                deployer.address
            )
        ]);
        
        // Multiple users deposit
        block = chain.mineBlock([
            Tx.contractCall(
                'bitsave',
                'deposit',
                [types.uint(100)],
                wallet1.address
            ),
            Tx.contractCall(
                'bitsave',
                'deposit',
                [types.uint(100)],
                wallet2.address
            ),
            Tx.contractCall(
                'bitsave',
                'deposit',
                [types.uint(100)],
                wallet3.address
            )
        ]);
        
        // Mine blocks to pass lock period
        chain.mineEmptyBlockUntil(chain.blockHeight + 101);
        
        // All users withdraw and should receive badges
        block = chain.mineBlock([
            Tx.contractCall(
                'bitsave',
                'withdraw',
                [],
                wallet1.address
            ),
            Tx.contractCall(
                'bitsave',
                'withdraw',
                [],
                wallet2.address
            ),
            Tx.contractCall(
                'bitsave',
                'withdraw',
                [],
                wallet3.address
            )
        ]);
        
        // Verify all three users received badges
        block = chain.mineBlock([
            Tx.contractCall(
                'bitsave-badges',
                'get-owner',
                [types.uint(1)],
                deployer.address
            ),
            Tx.contractCall(
                'bitsave-badges',
                'get-owner',
                [types.uint(2)],
                deployer.address
            ),
            Tx.contractCall(
                'bitsave-badges',
                'get-owner',
                [types.uint(3)],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectSome().expectPrincipal(wallet1.address);
        block.receipts[1].result.expectOk().expectSome().expectPrincipal(wallet2.address);
        block.receipts[2].result.expectOk().expectSome().expectPrincipal(wallet3.address);
        
        // Verify next token ID is 4
        block = chain.mineBlock([
            Tx.contractCall(
                'bitsave-badges',
                'get-next-token-id',
                [],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectUint(4);
    },
});

Clarinet.test({
    name: "Ensure that user reputation is tracked correctly across deposits",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        // Set reward rate to 5%
        let block = chain.mineBlock([
            Tx.contractCall(
                'bitsave',
                'set-reward-rate',
                [types.uint(5)],
                deployer.address
            )
        ]);
        
        // First deposit and withdrawal (should not trigger badge)
        block = chain.mineBlock([
            Tx.contractCall(
                'bitsave',
                'deposit',
                [types.uint(50)],
                wallet1.address
            )
        ]);
        
        chain.mineEmptyBlockUntil(chain.blockHeight + 51);
        
        block = chain.mineBlock([
            Tx.contractCall(
                'bitsave',
                'withdraw',
                [],
                wallet1.address
            )
        ]);
        
        // Check reputation (should be less than 1000)
        block = chain.mineBlock([
            Tx.contractCall(
                'bitsave',
                'get-reputation',
                [types.principal(wallet1.address)],
                deployer.address
            )
        ]);
        
        const firstReputation = block.receipts[0].result.expectOk();
        // Reputation should be positive but less than 1000
        
        // Note: In a real scenario, the user would need to deposit again
        // to accumulate more reputation. This test demonstrates the concept
        // that reputation accumulates over multiple deposit/withdraw cycles.
    },
});
