import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

/**
 * BitSave Badges NFT Contract Tests
 * 
 * Test Coverage:
 * 1. Contract deployment and initialization
 * 2. Admin functions (set-authorized-minter, transfer-admin)
 * 3. Badge minting (authorized and unauthorized)
 * 4. Badge transfer functionality
 * 5. Badge burning functionality
 * 6. Metadata retrieval
 * 7. Read-only functions
 */

Clarinet.test({
    name: "Ensure that contract deploys successfully and admin is set correctly",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        
        // Check that admin is set to deployer
        let block = chain.mineBlock([
            Tx.contractCall(
                'bitsave-badges',
                'get-admin',
                [],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectPrincipal(deployer.address);
    },
});

Clarinet.test({
    name: "Ensure that only admin can set authorized minter",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        
        // Admin should be able to set authorized minter
        let block = chain.mineBlock([
            Tx.contractCall(
                'bitsave-badges',
                'set-authorized-minter',
                [types.principal(wallet1.address)],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectPrincipal(wallet1.address);
        
        // Non-admin should not be able to set authorized minter
        block = chain.mineBlock([
            Tx.contractCall(
                'bitsave-badges',
                'set-authorized-minter',
                [types.principal(wallet2.address)],
                wallet2.address
            )
        ]);
        
        block.receipts[0].result.expectErr().expectUint(105); // ERR_UNAUTHORIZED
    },
});

Clarinet.test({
    name: "Ensure that only authorized minter can mint badges",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        
        const metadata = types.utf8('{"name":"Test Badge","tier":"bronze"}');
        
        // Deployer is authorized minter by default, should be able to mint
        let block = chain.mineBlock([
            Tx.contractCall(
                'bitsave-badges',
                'mint',
                [types.principal(wallet1.address), metadata],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectUint(1);
        
        // Unauthorized user should not be able to mint
        block = chain.mineBlock([
            Tx.contractCall(
                'bitsave-badges',
                'mint',
                [types.principal(wallet2.address), metadata],
                wallet2.address
            )
        ]);
        
        block.receipts[0].result.expectErr().expectUint(105); // ERR_UNAUTHORIZED
    },
});

Clarinet.test({
    name: "Ensure that badge owner can transfer their badge",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        
        const metadata = types.utf8('{"name":"Transfer Test Badge","tier":"silver"}');
        
        // Mint a badge to wallet1
        let block = chain.mineBlock([
            Tx.contractCall(
                'bitsave-badges',
                'mint',
                [types.principal(wallet1.address), metadata],
                deployer.address
            )
        ]);
        
        const tokenId = block.receipts[0].result.expectOk().expectUint(1);
        
        // Wallet1 should be able to transfer their badge to wallet2
        block = chain.mineBlock([
            Tx.contractCall(
                'bitsave-badges',
                'transfer',
                [
                    types.uint(tokenId),
                    types.principal(wallet1.address),
                    types.principal(wallet2.address)
                ],
                wallet1.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Verify new owner
        block = chain.mineBlock([
            Tx.contractCall(
                'bitsave-badges',
                'get-owner',
                [types.uint(tokenId)],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectSome().expectPrincipal(wallet2.address);
    },
});

Clarinet.test({
    name: "Ensure that only badge owner can burn their badge",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        
        const metadata = types.utf8('{"name":"Burn Test Badge","tier":"gold"}');
        
        // Mint a badge to wallet1
        let block = chain.mineBlock([
            Tx.contractCall(
                'bitsave-badges',
                'mint',
                [types.principal(wallet1.address), metadata],
                deployer.address
            )
        ]);
        
        const tokenId = block.receipts[0].result.expectOk().expectUint(1);
        
        // Non-owner should not be able to burn
        block = chain.mineBlock([
            Tx.contractCall(
                'bitsave-badges',
                'burn',
                [types.uint(tokenId)],
                wallet2.address
            )
        ]);
        
        block.receipts[0].result.expectErr().expectUint(106); // ERR_NOT_OWNER
        
        // Owner should be able to burn their badge
        block = chain.mineBlock([
            Tx.contractCall(
                'bitsave-badges',
                'burn',
                [types.uint(tokenId)],
                wallet1.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Verify badge no longer exists
        block = chain.mineBlock([
            Tx.contractCall(
                'bitsave-badges',
                'get-owner',
                [types.uint(tokenId)],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectNone();
    },
});

Clarinet.test({
    name: "Ensure that token metadata is stored and retrieved correctly",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        const metadata = types.utf8('{"name":"Metadata Test Badge","tier":"platinum","achievement":"1000_points"}');
        
        // Mint a badge with metadata
        let block = chain.mineBlock([
            Tx.contractCall(
                'bitsave-badges',
                'mint',
                [types.principal(wallet1.address), metadata],
                deployer.address
            )
        ]);
        
        const tokenId = block.receipts[0].result.expectOk().expectUint(1);
        
        // Retrieve and verify metadata
        block = chain.mineBlock([
            Tx.contractCall(
                'bitsave-badges',
                'get-token-uri',
                [types.uint(tokenId)],
                deployer.address
            )
        ]);
        
        const retrievedMetadata = block.receipts[0].result.expectOk().expectSome();
        assertEquals(retrievedMetadata, metadata);
    },
});

Clarinet.test({
    name: "Ensure that next-token-id increments correctly",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        const metadata = types.utf8('{"name":"Increment Test Badge"}');
        
        // Check initial next-token-id
        let block = chain.mineBlock([
            Tx.contractCall(
                'bitsave-badges',
                'get-next-token-id',
                [],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectUint(1);
        
        // Mint first badge
        block = chain.mineBlock([
            Tx.contractCall(
                'bitsave-badges',
                'mint',
                [types.principal(wallet1.address), metadata],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectUint(1);
        
        // Check next-token-id after first mint
        block = chain.mineBlock([
            Tx.contractCall(
                'bitsave-badges',
                'get-next-token-id',
                [],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectUint(2);
        
        // Mint second badge
        block = chain.mineBlock([
            Tx.contractCall(
                'bitsave-badges',
                'mint',
                [types.principal(wallet1.address), metadata],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectUint(2);
        
        // Check next-token-id after second mint
        block = chain.mineBlock([
            Tx.contractCall(
                'bitsave-badges',
                'get-next-token-id',
                [],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectUint(3);
    },
});
