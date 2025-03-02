import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Can submit a new project idea",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const title = "NFT Marketplace";
    const description = "Create a marketplace for NFTs";
    const category = "nft";
    
    let block = chain.mineBlock([
      Tx.contractCall('project-ideas', 'submit-idea',
        [types.ascii(title), types.ascii(description), types.ascii(category)],
        deployer.address
      )
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectOk().expectUint(1);
    
    const response = chain.callReadOnlyFn(
      'project-ideas',
      'get-idea',
      [types.uint(1)],
      deployer.address
    );
    
    const idea = response.result.expectOk().expectSome();
    assertEquals(idea.title, title);
    assertEquals(idea.description, description);
    assertEquals(idea.category, category);
    assertEquals(idea.votes, 0);
  }
});

Clarinet.test({
  name: "Can vote on an idea",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    // Submit idea first
    let block = chain.mineBlock([
      Tx.contractCall('project-ideas', 'submit-idea',
        [types.ascii("Test Idea"), types.ascii("Description"), types.ascii("test")],
        deployer.address
      )
    ]);
    
    // Vote on idea
    block = chain.mineBlock([
      Tx.contractCall('project-ideas', 'vote-idea',
        [types.uint(1), types.bool(true)],
        wallet1.address
      )
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectOk();
    
    // Verify vote count increased
    const response = chain.callReadOnlyFn(
      'project-ideas',
      'get-idea',
      [types.uint(1)],
      deployer.address
    );
    
    const idea = response.result.expectOk().expectSome();
    assertEquals(idea.votes, 1);
  }
});

Clarinet.test({
  name: "Cannot vote on same idea twice",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    // Submit and vote on idea
    let block = chain.mineBlock([
      Tx.contractCall('project-ideas', 'submit-idea',
        [types.ascii("Test Idea"), types.ascii("Description"), types.ascii("test")],
        deployer.address
      ),
      Tx.contractCall('project-ideas', 'vote-idea',
        [types.uint(1), types.bool(true)],
        wallet1.address
      )
    ]);
    
    // Try to vote again
    block = chain.mineBlock([
      Tx.contractCall('project-ideas', 'vote-idea',
        [types.uint(1), types.bool(true)],
        wallet1.address
      )
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectErr().expectUint(101); // err-already-voted
  }
});
